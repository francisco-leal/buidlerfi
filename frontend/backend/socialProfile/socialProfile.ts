import { getAirstackSocialData } from "@/lib/api/backend/airstack";
import { getEnsProfile } from "@/lib/api/common/ens";
import prisma from "@/lib/prisma";
import { ipfsToURL } from "@/lib/utils";
import { GetTalentResponse } from "@/models/talentProtocol.model";
import { SocialProfileType, User } from "@prisma/client";
import axios from "axios";

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
