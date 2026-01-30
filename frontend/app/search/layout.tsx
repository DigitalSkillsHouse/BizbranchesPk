import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Search Businesses - ${SITE_NAME}`,
  description:
    "Search our Pakistan business directory by name, category, or city. Find local businesses, read reviews, and get contact details.",
  keywords: "search businesses, business search Pakistan, find local businesses, directory search",
  alternates: { canonical: `${SITE_URL}/search` },
  openGraph: {
    title: `Search Businesses | ${SITE_NAME}`,
    description: "Search businesses by category, city, or name.",
    url: `${SITE_URL}/search`,
    type: "website",
  },
  twitter: { card: "summary", title: `Search | ${SITE_NAME}` },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
