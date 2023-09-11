'use client'
import { useState } from "react";
import { Lock } from "lucide-react";

export function ChatTab({ wallet } : { wallet: string }) {
  const [supporterKeys, setSupporterKeys] = useState(0);

  if (supporterKeys == 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Lock className="text-muted-foreground h-32 w-32 mb-6" />
        <p>Hold atleast one key to access the chat.</p>
      </div>
    )
  }

  return (
    <>
      <h1>CHAT</h1>
    </>
  )
}
