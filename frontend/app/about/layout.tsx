import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `About Us - ${SITE_NAME}`,
  description:
    "Learn about LocatorBranches – Pakistan's premier business directory. Our mission is to connect businesses with customers. Find local businesses, read reviews, and grow your business.",
  keywords: "about LocatorBranches, business directory Pakistan, find local businesses, about us",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description: "Pakistan's premier business directory. Connect with local businesses and grow your reach.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
  twitter: { card: "summary", title: `About Us | ${SITE_NAME}` },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
