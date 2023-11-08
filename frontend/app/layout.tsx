import { Flex } from "@/components/shared/flex";
import { Metadata } from "next";
import InnerLayout from "./innerLayout";

export const metadata: Metadata = {
  title: "builder.fi by Talent Protocol",
  description: "Where experienced builders can monetize their knowledge and earn crypto by answering questions.",
  openGraph: {
    images: ["https://builder.fi/thumbnail.jpg?2"],
    type: "website",
    title: "builder.fi by Talent Protocol",
    description: "Where experienced builders can monetize their knowledge and earn crypto by answering questions.",
    url: "https://buidlerfi.vercel.app/"
  },
  twitter: {
    images: ["https://builder.fi/thumbnail.jpg?2"],
    card: "summary_large_image"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex lang="en" component={"html"} suppressHydrationWarning grow>
      <InnerLayout> {children}</InnerLayout>
    </Flex>
  );
}
