"use client";
import { useAccount } from "wagmi";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { GraphContext } from "@/lib/context";
import { useContext, useState, useEffect } from "react";
import { UserItem } from "@/components/user-item";
import { init, useQuery } from "@airstack/airstack-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// @ts-ignore
init(process.env.NEXT_PUBLIC_AIRSTACK_TOKEN);

const QUERY = `query GetSocial($identity: Identity!) {
  SocialFollowers(input: {filter: {identity: {_eq: $identity}}, blockchain: ALL}) {
    Follower {
      dappName
      dappSlug
      followerAddress {
        identity
        domains {
          isPrimary
          name
        }
      }
    }
  }
}
`;

export default function Home() {
  const [users, setUsers] = useState<any>([]);
  const [user, setUser] = useState<any>();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const graphContext = useContext(GraphContext);
  const { data: socialFollowers, loading } = useQuery(QUERY, {
    identity: address
  });
  const [followers, setFollowers] = useState<any>([]);
  const router = useRouter();

  useEffect(() => {
    //@ts-ignore
    if (!graphContext.graphData) return;

    //@ts-ignore
    setUsers(graphContext.graphData.shareParticipants);

    //@ts-ignore
  }, [graphContext.graphData]);

  useEffect(() => {
    if (!socialFollowers) return;

    const airstackFollowers = socialFollowers.SocialFollowers?.Follower?.map((item: any) => {
      return {
        id: item.followerAddress.identity,
        name:
          item.followerAddress.domains?.find((domain: any) => domain.isPrimary)?.name || item.followerAddress.identity,
        dappName: item.dappName
      };
    });

    if (airstackFollowers?.length) {
      setFollowers(airstackFollowers);
    }
  }, [socialFollowers]);

  useEffect(() => {
    if (!address) return;
    if (user) return;

    upsertUser(address);
  }, [address]);

  const upsertUser = async (address: string | undefined) => {
    const response = await axios.put("/api/users", {
      wallet: address
    });

    setUser(response.data.user);
  };

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Icons.spinner className="text-muted-foreground h-32 w-32 animate-spin mb-6" />
        <p>Connecting...</p>
      </div>
    );
  }

  if (isDisconnected) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Wallet className="text-muted-foreground h-32 w-32 mb-6" />
        <p>Please connect your wallet to proceed.</p>
      </div>
    );
  }

  const sortUsers = (a: { numberOfHolders: number }, b: { numberOfHolders: number }) =>
    a.numberOfHolders > b.numberOfHolders ? -1 : 1;

  return (
    <main className="py-4 px-2">
      <Tabs defaultValue="top" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="top">Top</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
        <TabsContent value="top" className="space-y-4">
          {users.sort(sortUsers).map((item: any) => (
            <UserItem item={item} key={`home-${item.owner}`} />
          ))}
        </TabsContent>
        <TabsContent value="recommended" className="space-y-4 pb-16">
          {followers.length == 0 && (
            <div className="flex flex-col items-center justify-center mt-24">
              <Wallet className="text-muted-foreground h-32 w-32 mb-6" />
              <p>We could find any connections to recommend based on your wallet.</p>
            </div>
          )}
          {followers.length > 0 &&
            followers.map((item: any) => (
              <div
                key={`followers-${item.id}`}
                className="flex items-center justify-between w-full rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push(`/${item.owner}`)}
              >
                <div className="space-x-4 flex items-center">
                  <Avatar className="mt-px h-5 w-5">
                    <AvatarImage src={DEFAULT_PROFILE_PICTURE} />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <Badge variant="outline">{item.dappName}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/${item.id}`)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </TabsContent>
      </Tabs>
    </main>
  );
}
