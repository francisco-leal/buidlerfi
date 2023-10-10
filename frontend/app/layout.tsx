"use client";

import { Flex } from "@/components/shared/flex";
import { useEffect, useState } from "react";
import { Dynamic } from "../components/app/dynamic";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <Flex y component={"body"} sx={{ height: "100%" }}>
        {mounted && <Dynamic>{children}</Dynamic>}
      </Flex>
    </html>
  );
}
