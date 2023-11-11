"use server";

import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { privyUser } from "@/models/helpers.model";
import { fetchHolders } from "../../lib/api/common/builderfi";
import { updateUserSocialProfiles } from "../socialProfile/socialProfile";

export const refreshAllUsersProfile = async () => {
  const users = await prisma.user.findMany();
  for (const user of users) {
    try {
      await updateUserSocialProfiles(user);
    } catch (err) {
      console.error("Error while updating social profiles for user: ", user.wallet, err);
    }
  }
  return { data: users };
};

//Refresh socials profiles
export const refreshCurrentUserProfile = async (privyUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    }
  });

  const res = await updateUserSocialProfiles(user!);
  return { data: res };
};

export const getCurrentUser = async (privyUserId: string) => {
  const res = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    },
    include: {
      inviteCodes: {
        where: {
          isActive: true
        }
      },
      socialProfiles: true,
      points: true
    }
  });
  return { data: res };
};

export const checkUsersExist = async (wallets: string[]) => {
  const addresses = wallets.map(wallet => wallet.toLowerCase());
  const res = await prisma.user.findMany({
    where: {
      wallet: {
        in: addresses
      }
    }
  });
  return { data: res };
};

export const getUser = async (wallet: string) => {
  const address = wallet.toLowerCase();
  const res = await prisma.user.findUnique({
    where: {
      wallet: address
    },
    include: {
      socialProfiles: true
    }
  });
  if (res) return { data: res };

  // Wallet can be found in graph if user bypassed frontend and made tx directly on the contract.
  // In that case, user will not exist in DB. So we query the graph to see if wallet has any holders.
  // And if he does, we create a new user in DB with active = false
  const holders = await fetchHolders(address);
  if (holders.length <= 0) return { error: ERRORS.USER_NOT_FOUND };

  const newUser = await prisma.user.create({
    data: {
      wallet: address,
      isActive: false
    }
  });

  const user = await updateUserSocialProfiles(newUser);

  return { data: user };
};

export const createUser = async (privyUser: privyUser, inviteCode: string) => {
  if (!privyUser || !privyUser.id || !privyUser.wallet) {
    return { error: ERRORS.INVALID_REQUEST };
  }

  const address = privyUser.wallet.address.toLowerCase();

  const existingCode = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
  if (!existingCode || existingCode.isActive === false) {
    return { error: ERRORS.INVALID_INVITE_CODE };
  }

  if (existingCode.used >= existingCode.maxUses) {
    return { error: ERRORS.CODE_ALREADY_USED };
  }

  const newUser = await prisma.$transaction(async tx => {
    const newUser = await tx.user.upsert({
      where: { wallet: address },
      create: {
        privyUserId: privyUser.id,
        wallet: address,
        isActive: true
      },
      update: {
        privyUserId: privyUser.id,
        isActive: true
      }
    });

    await tx.inviteCode.update({
      where: { id: existingCode.id },
      data: {
        used: existingCode.used + 1
      }
    });

    return newUser;
  });

  try {
    await updateUserSocialProfiles(newUser);
  } catch (err) {
    console.error("Error while updating social profiles: ", err);
  }

  return { data: newUser };
};
