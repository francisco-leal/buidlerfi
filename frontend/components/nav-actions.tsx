"use client"

import * as React from "react"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { useDisconnect, useAccount } from "wagmi";

export function NavActions() {
  const router = useRouter()
  const { disconnect } = useDisconnect()
  const { address, isConnecting, isDisconnected } = useAccount();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <span className="sr-only">Actions</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push("/")}>
            Explore
          </DropdownMenuItem>
          {address && <DropdownMenuItem onSelect={() => router.push(`/${address}`)}>
            Profile
          </DropdownMenuItem>}
          <DropdownMenuItem onSelect={() => router.push("/chats")}>
            Chats
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => disconnect()}
            className="text-red-500"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}