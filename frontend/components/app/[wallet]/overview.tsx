"use client";
import { EthIcon } from "@/components/icons/ethIcon";
import { Flex } from "@/components/shared/flex";
import { WalletAddress } from "@/components/shared/wallet-address";
import { useProfileContext } from "@/contexts/profileContext";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { ENS_LOGO, FARCASTER_LOGO, LENS_LOGO, TALENT_PROTOCOL_LOGO } from "@/lib/assets";
import { formatEth, shortAddress } from "@/lib/utils";
import { EditOutlined } from "@mui/icons-material";
import { Avatar, Button, Chip, Link as JoyLink, Skeleton, Typography } from "@mui/joy";
import { SocialProfileType } from "@prisma/client";
import Image from "next/image";
import { FC, useMemo } from "react";

interface Props {
  setBuyModalState: (state: "closed" | "buy" | "sell") => void;
}

export const socialInfo = {
  [SocialProfileType.TALENT_PROTOCOL]: {
    name: "Talent Protocol",
    icon: <Image width={20} height={20} src={TALENT_PROTOCOL_LOGO} alt="Talent Protocol logo" />,
    url: (_: string, address: string) => `https://beta.talentprotocol.com/u/${address}`
  },
  [SocialProfileType.FARCASTER]: {
    name: "Farcaster",
    icon: <Image width={20} height={20} src={FARCASTER_LOGO} alt="Farcaster logo" />,
    url: (username: string) => `https://warpcast.com/${username}`
  },
  [SocialProfileType.LENS]: {
    name: "Lens",
    icon: <Image width={20} height={20} src={LENS_LOGO} alt="Lens logo" />,
    url: (username: string) => `https://hey.xyz/u/${username.replace("lens/@", "")}`
  },
  [SocialProfileType.ENS]: {
    name: "ENS",
    icon: <Image width={20} height={20} src={ENS_LOGO} alt="Ens logo" />,
    url: (username: string) => `https://app.ens.domains/${username}`
  }
};
export const socialsOrder = Object.keys(socialInfo);

export const Overview: FC<Props> = ({ setBuyModalState }) => {
  const { user: currentUser } = useUserContext();
  const {
    hasKeys,
    holders,
    ownedKeysCount,
    isOwnProfile,
    user,
    recommendedUser,
    holdings,
    isLoading: isLoadingProfile
  } = useProfileContext();

  const router = useBetterRouter();

  const { buyPrice, supply } = useGetBuilderInfo(user?.wallet);
  const refreshData = useRefreshCurrentUser();

  const keysPlural = () => {
    if (ownedKeysCount != 1) {
      return "keys";
    } else {
      return "key";
    }
  };

  const avatarUrl = useMemo(() => {
    return user?.avatarUrl || recommendedUser?.avatarUrl || "";
  }, [user, recommendedUser]);

  const recommendedName = () =>
    recommendedUser?.talentProtocol ||
    recommendedUser?.farcaster ||
    recommendedUser?.lens ||
    recommendedUser?.ens ||
    shortAddress(recommendedUser?.wallet || "");

  const name = useMemo(() => user?.displayName || recommendedName(), [user, recommendedUser]);

  const allSocials = useMemo(() => {
    if (user?.socialProfiles?.length) {
      return user?.socialProfiles;
    } else {
      const otherSocials = [];

      if (recommendedUser?.talentProtocol) {
        otherSocials.push({
          type: SocialProfileType.TALENT_PROTOCOL,
          profileName: recommendedUser.talentProtocol,
          socialAddress: recommendedUser.wallet
        });
      }
      if (recommendedUser?.farcaster) {
        otherSocials.push({
          type: SocialProfileType.FARCASTER,
          profileName: recommendedUser.farcaster
        });
      }
      if (recommendedUser?.lens) {
        otherSocials.push({
          type: SocialProfileType.LENS,
          profileName: recommendedUser.lens
        });
      }
      if (recommendedUser?.ens) {
        otherSocials.push({
          type: SocialProfileType.ENS,
          profileName: recommendedUser.ens
        });
      }
      return otherSocials;
    }
  }, [user, recommendedUser]);

  return (
    <>
      <Flex y gap2 p={2}>
        <Skeleton variant="circular" width={80} height={80} loading={isLoadingProfile}>
          <Flex x xsb mb={-1}>
            <Avatar size="lg" sx={{ height: "80px", width: "80px" }} src={avatarUrl} alt={name}></Avatar>
            <Flex x ys gap1>
              {isOwnProfile && (
                <Button
                  sx={{ width: "36px", height: "36px" }}
                  variant="outlined"
                  color="neutral"
                  loading={!!currentUser?.socialWallet && refreshData.isLoading}
                  onClick={() => router.push("./edit")}
                >
                  <EditOutlined />
                </Button>
              )}
              {hasKeys && (
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setBuyModalState("sell")}
                  disabled={(supply || 0) <= BigInt(1)}
                >
                  Sell
                </Button>
              )}

              <Button onClick={() => setBuyModalState("buy")} disabled={supply === BigInt(0) && !isOwnProfile}>
                {isOwnProfile && holders?.length === 0 ? "Create keys" : "Buy"}
              </Button>
            </Flex>
          </Flex>
          <Flex x yc gap1>
            <Flex y fullwidth>
              {!!name ? (
                <Typography level="h2">
                  {name}
                  {/* <Skeleton loading={!user || isLoadingProfile}>{name}</Skeleton> */}
                </Typography>
              ) : (
                <WalletAddress
                  address={user?.wallet || recommendedUser?.wallet || ""}
                  level="h3"
                  removeCopyButton={!isOwnProfile}
                />
              )}
              {/* Only display if user has a display name */}
              <Flex x yc gap={0.5} height="20px">
                <Typography level="title-sm" startDecorator={<EthIcon size="sm" />}>
                  {formatEth(buyPrice)}
                </Typography>
                {ownedKeysCount > 0 && (
                  <Typography level="body-sm">
                    • You own {ownedKeysCount?.toString()} {keysPlural()}
                  </Typography>
                )}
              </Flex>
            </Flex>
          </Flex>

          {user?.bio && <Typography level="body-sm">{user.bio}</Typography>}
          {user?.tags && user?.tags.length > 0 && (
            <Flex x yc gap1>
              {user.tags.map(tag => (
                <Chip variant="outlined" color="neutral" key={tag.id}>
                  {tag.name}
                </Chip>
              ))}
            </Flex>
          )}

          {ownedKeysCount === 0 && !user ? (
            <Typography level="body-sm">{`${name} is not on builder.fi yet`}</Typography>
          ) : (
            <Flex x gap2 pointer onClick={() => router.push("./holders")}>
              <Typography level="body-sm">
                <strong>{holders?.length}</strong> holders
              </Typography>
              <Typography level="body-sm">
                <strong>{holdings?.length}</strong> holding
              </Typography>
            </Flex>
          )}

          <Flex x gap2 flexWrap={"wrap"}>
            {allSocials
              .sort((a, b) => {
                return socialsOrder.indexOf(a.type) - socialsOrder.indexOf(b.type);
              })
              .map(social => {
                const additionalData = socialInfo[social.type as keyof typeof socialInfo];
                return (
                  <JoyLink
                    key={social.type}
                    href={additionalData.url(social.profileName, user?.socialWallet || recommendedUser?.wallet || "")}
                    target="_blank"
                    textColor={"link"}
                    variant="outlined"
                    color="neutral"
                    p={1}
                    sx={{ borderRadius: "50%" }}
                  >
                    {additionalData.icon}
                  </JoyLink>
                );
              })}
          </Flex>
        </Skeleton>
      </Flex>
    </>
  );
};
