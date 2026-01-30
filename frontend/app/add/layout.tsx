import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `List Your Business - Free Business Directory | ${SITE_NAME}`,
  description:
    "Add your business to Pakistan's premier business directory. Free listing with instant visibility. List restaurants, services, shops and more.",
  keywords:
    "business listing, free business directory, add business, Pakistan business directory, business registration, list your business",
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