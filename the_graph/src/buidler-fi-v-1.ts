import { BigInt, store } from "@graphprotocol/graph-ts";
import { Trade as TradeEvent } from "../generated/BuilderFiAlphaV1/BuilderFiAlphaV1";
import { ShareParticipant, ShareRelationship, Trade } from "../generated/schema";

const ONE_BI = BigInt.fromI32(1);
const ZERO_BI = BigInt.fromI32(0);

export function handleTrade(event: TradeEvent): void {
  // CREATE TRANSACTION INFO
  let entity = new Trade(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.trader = event.params.trader;
  entity.builder = event.params.builder;
  entity.isBuy = event.params.isBuy;
  entity.shareAmount = event.params.shareAmount;
  entity.ethAmount = event.params.ethAmount;
  entity.protocolEthAmount = event.params.protocolEthAmount;
  entity.builderEthAmount = event.params.builderEthAmount;
  entity.supply = event.params.supply;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  // CREATE BUYER INFO

  let buyer = ShareParticipant.load(event.params.trader.toHexString());
  // load buyer
  if (buyer === null) {
    buyer = new ShareParticipant(event.params.trader.toHexString());
    buyer.numberOfHoldings = ZERO_BI;
    buyer.numberOfHolders = ZERO_BI;
    buyer.supply = ZERO_BI;
    buyer.owner = event.params.trader.toHexString();
    buyer.tradingFeesAmount = ZERO_BI;
  }

  // CREATE SUBJECT INFO

  let subject = ShareParticipant.load(event.params.builder.toHexString());
  // load subject
  if (subject === null) {
    subject = new ShareParticipant(event.params.builder.toHexString());
    subject.supply = ONE_BI;
    subject.numberOfHolders = ZERO_BI;
    subject.numberOfHoldings = ZERO_BI;
    subject.owner = event.params.builder.toHexString();
    subject.tradingFeesAmount = event.params.builderEthAmount;
  } else {
    subject.tradingFeesAmount = subject.tradingFeesAmount.plus(event.params.builderEthAmount);
    if (event.params.isBuy) {
      subject.supply = subject.supply.plus(ONE_BI);
    } else {
      subject.supply = subject.supply.minus(ONE_BI);
    }
  }

  // edge case where we buy/sell from ourselves
  subject.buyPrice = event.params.nextPrice;
  subject.sellPrice = event.params.ethAmount;
  if (subject.id == buyer.id) {
    buyer.buyPrice = subject.buyPrice;
    buyer.sellPrice = subject.sellPrice;
    buyer.tradingFeesAmount = subject.tradingFeesAmount;
  }

  // CREATE RELATIONSHIP INFO
  let relationshipID = event.params.trader.toHexString() + "-" + event.params.builder.toHexString();
  let relationship = ShareRelationship.load(relationshipID);
  if (relationship === null) {
    relationship = new ShareRelationship(relationshipID);
    // the number of holders/holding only changes if the relationship did not exist before
    subject.numberOfHolders = subject.numberOfHolders.plus(ONE_BI);
    buyer.numberOfHoldings = buyer.numberOfHoldings.plus(ONE_BI);

    // edge case where we buy/sell from ourselves
    if (subject.id == buyer.id) {
      buyer.numberOfHolders = subject.numberOfHolders;
      subject.numberOfHoldings = buyer.numberOfHoldings;
    }
    relationship.holder = buyer.id;
    relationship.owner = subject.id;
    relationship.supporterNumber = subject.numberOfHolders;
    relationship.heldKeyNumber = ONE_BI;
  } else {
    if (event.params.isBuy) {
      if (relationship.heldKeyNumber == ZERO_BI) {
        subject.numberOfHolders = subject.numberOfHolders.plus(ONE_BI);
        buyer.numberOfHoldings = buyer.numberOfHoldings.plus(ONE_BI);
      }
      relationship.heldKeyNumber = relationship.heldKeyNumber.plus(ONE_BI);
    } else {
      relationship.heldKeyNumber = relationship.heldKeyNumber.minus(ONE_BI);
      if (relationship.heldKeyNumber == ZERO_BI) {
        subject.numberOfHolders = subject.numberOfHolders.minus(ONE_BI);
        buyer.numberOfHoldings = buyer.numberOfHoldings.minus(ONE_BI);
        relationship.supporterNumber = ZERO_BI;
      }
    }
  }

  buyer.save();
  subject.save();

  if (relationship.heldKeyNumber == ZERO_BI) {
    store.remove("ShareRelationship", relationshipID);
  } else {
    relationship.save();
  }
}
