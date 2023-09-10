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
import { useDisconnect } from "wagmi";

export function NavActions() {
  const router = useRouter()
  const { disconnect } = useDisconnect()

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
            Home
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/portfolio")}>
            Portfolio
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/explore")}>
            Explore
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