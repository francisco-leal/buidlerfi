import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"

import { NavActions } from "@/components/nav-actions"
import { NavWeb3Button } from "@/components/nav-web3-button"

export const metadata: Metadata = {
  title: "BuidlerFi",
  description: "The open platform for builders.",
}

export default function Home() {
  return (
    <>
      <div className="h-full flex-col">
        <div className="container flex items-center justify-between py-4 h-16">
          <h2 className="text-lg font-semibold">BuidlerFi</h2>
          <div className="ml-auto flex w-full space-x-2 justify-end">
            <NavWeb3Button />
            <NavActions />
          </div>
        </div>
        <Separator />
        <h1>BuidlerFi</h1>
      </div>
    </>
  )
}