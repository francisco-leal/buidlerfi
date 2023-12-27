"use server";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BUIILDER_FI_V1_EVENT_SIGNATURE, BUILDERFI_CONTRACT, IN_USE_CHAIN_ID } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import viemClient from "@/lib/viemClient";
import { decodeEventLog, parseAbiItem } from "viem";

const logsRange = process.env.LOGS_RANGE_SIZE ? BigInt(process.env.LOGS_RANGE_SIZE) : 100n;

interface EventLog {
  eventName: "Trade";
  args: {
    trader: `0x${string}`;
    builder: `0x${string}`;
    isBuy: boolean;
    shareAmount: bigint;
    ethAmount: bigint;
    protocolEthAmount: bigint;
    builderEthAmount: bigint;
    supply: bigint;
    nextPrice: bigint;
  };
}

const storeTransactionInternal = async (log: EventLog, hash: string, blockNumber: bigint, timestamp: bigint) => {
  //Check if transaction already exists in DB
  let transaction = await prisma.trade.findFirst({
    where: {
      hash: hash
    }
  });

  //If transaction has been processed, we don't need to update keyRelationship
  if (transaction && transaction.processed) {
    return false;
  }

  //If transaction doesn't exist, we create it
  if (!transaction) {
    transaction = await prisma.trade.create({
      data: {
        hash: hash,
        chainId: IN_USE_CHAIN_ID,
        amount: log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount,
        ethCost: log.args.ethAmount,
        protocolFee: log.args.protocolEthAmount,
        ownerFee: log.args.builderEthAmount,
        block: blockNumber,
        timestamp: timestamp,
        holderAddress: log.args.builder.toLowerCase(),
        ownerAddress: log.args.trader.toLowerCase(),
        //Transaction has been found, but not processed yet
        processed: false
      }
    });
  }

  const owner = await prisma.user.findUnique({
    where: {
      wallet: log.args.builder.toLowerCase()
    }
  });

  const holder = await prisma.user.findUnique({
    where: {
      wallet: log.args.trader.toLowerCase()
    }
  });

  //If one of the users doesn't exist, we leave the transaction as unprocessed
  if (!owner || !holder) {
    return false;
  }

  await prisma.$transaction(async tx => {
    const key = await tx.keyRelationship.findFirst({
      where: {
        holderId: holder.id,
        ownerId: owner.id
      }
    });

    if (!key) {
      await tx.keyRelationship.create({
        data: {
          holderId: holder.id,
          ownerId: owner.id,
          amount: log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount
        }
      });
    } else {
      await tx.keyRelationship.update({
        where: {
          id: key.id
        },
        data: {
          amount: key.amount + (log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount)
        }
      });
    }

    await tx.trade.update({
      where: {
        hash: hash
      },
      data: {
        processed: true
      }
    });
  });

  return true;
};

export const storeTransaction = async (hash: `0x${string}`) => {
  let onchainTransaction = null;
  try {
    onchainTransaction = await viemClient.getTransactionReceipt({
      hash
    });
  } catch (err) {
    console.log("Transaction not mined yet... waiting for confirmations for: ", hash);
    onchainTransaction = await viemClient.waitForTransactionReceipt({ hash });
  }

  if (!onchainTransaction) {
    console.log("No transaction found for hash: ", hash);
    return { error: ERRORS.NOT_FOUND };
  }

  if (onchainTransaction.logs.length === 0) {
    console.log("No logs found for hash: ", hash);
    return { error: ERRORS.NOT_FOUND };
  }

  const eventLog = decodeEventLog({
    abi: builderFIV1Abi,
    data: onchainTransaction.logs[0].data,
    topics: onchainTransaction.logs[0].topics
  });

  if (!eventLog || eventLog.eventName !== "Trade") {
    console.log("No Trade event found for hash: ", hash);
    return { error: ERRORS.NOT_FOUND };
  }

  const block = await viemClient.getBlock({
    blockHash: onchainTransaction.blockHash
  });

  await storeTransactionInternal(eventLog, hash, onchainTransaction.blockNumber, block.timestamp);

  return { data: hash };
};

export const processAnyPendingTransactions = async (privyUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    }
  });

  if (!user?.isAdmin) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  const systemSetting = await prisma.systemSetting.upsert({
    where: {
      key: "lastProcessedBlock"
    },
    update: {},
    create: {
      key: "lastProcessedBlock",
      value: BUILDERFI_CONTRACT.startBlock.toString()
    }
  });

  const lastProcessedBlock = BigInt(systemSetting.value);

  const latestBlock = await viemClient.getBlockNumber();

  console.log("--------------------");
  console.log("START SYNC FROM BLOCK: ", lastProcessedBlock);

  for (let i = lastProcessedBlock; i < latestBlock; i += logsRange) {
    const searchUntil = i + logsRange;
    const logs = await viemClient.getLogs({
      address: BUILDERFI_CONTRACT.address,
      event: parseAbiItem(BUIILDER_FI_V1_EVENT_SIGNATURE),
      fromBlock: i,
      toBlock: searchUntil > latestBlock ? latestBlock : searchUntil,
      strict: true
    });

    console.log("SEARCHED FROM: ", i);
    console.log("SEARCHED TO: ", searchUntil);

    for (const log of logs) {
      const block = await viemClient.getBlock({
        blockHash: log.blockHash
      });

      await storeTransactionInternal(log, log.blockHash, log.blockNumber, block.timestamp).catch(err =>
        console.error(err)
      );
    }

    await prisma.systemSetting.update({
      where: {
        key: "lastProcessedBlock"
      },
      data: {
        value: i.toString()
      }
    });
  }

  return { data: "success" };
};
