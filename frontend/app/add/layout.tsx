import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `List Your Business - Free Business Directory | ${SITE_NAME}`,
  description:
    "Add your business free to Pakistan's business directory. Free listing with visibility. List restaurants, services, shops and more.",
  keywords:
    "add business free Pakistan, free business listing, Pakistan business directory, list your business",
  alternates: { canonical: `${SITE_URL}/add` },
  openGraph: {
    title: `List Your Business | ${SITE_NAME}`,
    description: "Free business listing with instant visibility on our directory.",
    url: `${SITE_URL}/add`,
    type: "website",
  },
  twitter: { card: "summary", title: `List Your Business | ${SITE_NAME}` },
};

export default function AddLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}