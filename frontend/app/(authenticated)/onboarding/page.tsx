"use client";

import ConnectWallet from "@/components/app/onboarding/connect-wallet";
import Deposit from "@/components/app/onboarding/deposit";
import LaunchKey from "@/components/app/onboarding/launch-key";
import Username from "@/components/app/onboarding/username";
import { useUserContext } from "@/contexts/userContext";
import { BUILDERFI_CONTRACT } from "@/lib/constants";
import * as React from "react";
import { useBalance, useContractRead } from "wagmi";

interface ProfileDetails {
  name: string | undefined;
  wallet: string | undefined;
}

const defaultProfileDetails: ProfileDetails = {
  name: undefined,
  wallet: undefined
};

export default function Onboarding() {
  const [profileInformation, setProfileInformation] = React.useState<ProfileDetails>(defaultProfileDetails);
  const [step, setStep] = React.useState(1);
  const user = useUserContext();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: user.address
  });

  const { data: hasOwnKey, refetch: refetchKeyOwnership } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "builderKeysBalance",
    args: [user.address!, user.address!],
    enabled: !!user.address
  });

  const changeAttribute = (value: string | boolean, key: string) => {
    setProfileInformation({
      ...profileInformation,
      [key]: value
    });
  };

  React.useEffect(() => {
    // Add how much ETH the user should have
    if (balance) {
      console.log("Balance: ", balance);
      changeAttribute(true, "hasBalance");
    }
  }, [balance]);

  React.useEffect(() => {
    if (!profileInformation.wallet && !user.user?.socialWallet) {
      // user needs to have a connected wallet, otherwise we show this onboarding step
      setStep(1);
    } else if (!profileInformation.name && !user.user?.displayName) {
      // user needs to have a display name, otherwise he will need to set one
      setStep(2);
    } else if (!balance) {
      // user needs to have atleast 0.01 ETH, otherwise he will need to deposit
      setStep(3);
    } else if (!hasOwnKey) {
      // user needs to have a builder key, otherwise he will need to launch one
      setStep(4);
    }
  }, [balance, hasOwnKey, profileInformation.name, profileInformation.wallet]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ConnectWallet onWalletAdded={(wallet: string) => changeAttribute(wallet, "wallet")} />;
      case 2:
        return <Username />;
      case 3:
        return <Deposit />;
      case 4:
        return <LaunchKey />;
      default:
        return <ConnectWallet onWalletAdded={(wallet: string) => changeAttribute(wallet, "wallet")} />;
    }
  };

  console.log("Has own key: ", hasOwnKey);
  console.log("Address: ", user.address);
  console.log("Builderfi contract: ", BUILDERFI_CONTRACT);
  console.log("User: ", user);

  return renderStep();
}
