import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy - ${SITE_NAME}`,
  description:
    "LocatorBranches Privacy Policy. How we collect, use and protect your data when you use our business directory and listing services.",
  keywords: "privacy policy, LocatorBranches privacy, data protection",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How we handle your data on LocatorBranches.",
    url: `${SITE_URL}/privacy`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
