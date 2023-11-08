"use server";

import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { generateRandomString, ipfsToURL } from "@/lib/utils";
import { privyUser } from "@/models/helpers.model";
import { GetTalentResponse } from "@/models/talentProtocol.model";
import { SocialProfileType, User } from "@prisma/client";
import axios from "axios";
import { getAirstackSocialData } from "../../lib/api/backend/airstack";
import { fetchHolders } from "../../lib/api/common/builderfi";
import { getEnsProfile } from "../../lib/api/common/ens";

export const refreshAllUsersProfile = async (privyUserId: string) => {
  //Check if user has admin role
  const user = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    }
  });
  if (!user?.isAdmin) return { error: ERRORS.UNAUTHORIZED };

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
      inviteCodes: true,
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
  if (!existingCode) {
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

    const tryGenerateUniqueCode = async (): Promise<string> => {
      const code = "bf-" + generateRandomString(8);
      const existing = await tx.inviteCode.findUnique({ where: { code } });
      if (existing) {
        return await tryGenerateUniqueCode();
      }
      return code;
    };

    //Generate 3 invite codes
    await Promise.all(
      [0, 0, 0].map(async () => {
        const code = await tryGenerateUniqueCode();

        return await tx.inviteCode.create({
          data: {
            code: code,
            userId: newUser.id,
            used: 0,
            maxUses: 1
          }
        });
      })
    );

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

export const updateUserSocialProfiles = async (user: User) => {
  let ensProfile: { name?: string | null; avatar?: string } = {};
  let talentProtocolProfile: GetTalentResponse | undefined;
  let lensProfile:
    | {
        dappName: string;
        profileName: string;
        profileImage: string;
      }
    | undefined;
  let farcasterProfile:
    | {
        dappName: string;
        profileName: string;
        profileImage: string;
      }
    | undefined;
  try {
    ensProfile = await getEnsProfile(user.wallet as `0x${string}`);
    if (ensProfile.name) {
      await prisma.socialProfile.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: SocialProfileType.ENS
          }
        },
        update: {
          profileName: ensProfile.name,
          profileImage: ensProfile.avatar
        },
        create: {
          profileName: ensProfile.name,
          profileImage: ensProfile.avatar,
          type: SocialProfileType.ENS,
          userId: user.id
        }
      });
    }
  } catch (err) {
    console.error("Error while updating ENS profile: ", err);
  }

  try {
    talentProtocolProfile = await axios
      .get<GetTalentResponse>(`${process.env.TALENT_PROTOCOL_API_BASE_URL}/talents/${user.wallet}`)
      .then(res => res.data)
      .catch(() => undefined);
    if (talentProtocolProfile) {
      let url = "";
      try {
        const imageUrl = new URL(talentProtocolProfile.talent.profile_picture_url);
        url = imageUrl.origin + imageUrl.pathname;
      } catch {
        // ignore, leave empty
      }

      await prisma.socialProfile.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: SocialProfileType.TALENT_PROTOCOL
          }
        },
        update: {
          profileName: talentProtocolProfile.talent.name,
          profileImage: url
        },
        create: {
          profileName: talentProtocolProfile.talent.name,
          profileImage: url,
          type: SocialProfileType.TALENT_PROTOCOL,
          userId: user.id
        }
      });
    }
  } catch (err) {
    console.error("Error while updating Talent Protocol profile: ", err);
  }

  try {
    const airstackData = await getAirstackSocialData(user.wallet);
    lensProfile = airstackData?.socials?.find(social => social.dappName === "lens");
    farcasterProfile = airstackData?.socials?.find(social => social.dappName === "farcaster");
    if (lensProfile) {
      await prisma.socialProfile.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: SocialProfileType.LENS
          }
        },
        update: {
          profileName: lensProfile.profileName,
          profileImage: ipfsToURL(lensProfile.profileImage)
        },
        create: {
          profileName: lensProfile.profileName,
          profileImage: ipfsToURL(lensProfile.profileImage),
          type: SocialProfileType.LENS,
          userId: user.id
        }
      });
    }

    if (farcasterProfile) {
      await prisma.socialProfile.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: SocialProfileType.FARCASTER
          }
        },
        update: {
          profileName: farcasterProfile.profileName,
          profileImage: ipfsToURL(farcasterProfile.profileImage)
        },
        create: {
          profileName: farcasterProfile.profileName,
          profileImage: ipfsToURL(farcasterProfile.profileImage),
          type: SocialProfileType.FARCASTER,
          userId: user.id
        }
      });
    }
  } catch (err) {
    console.error("Error while updating Airstack profile: ", err);
  }

  const defaultAvatar =
    talentProtocolProfile?.talent.profile_picture_url ||
    farcasterProfile?.profileImage ||
    lensProfile?.profileImage ||
    ensProfile.avatar;
  const defaultName =
    talentProtocolProfile?.talent.name || farcasterProfile?.profileName || lensProfile?.profileName || ensProfile.name;

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      avatarUrl: defaultAvatar,
      displayName: defaultName
    },
    include: {
      socialProfiles: true
    }
  });
};
