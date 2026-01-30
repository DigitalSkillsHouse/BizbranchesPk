import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms of Service - ${SITE_NAME}`,
  description:
    "Terms of Service for LocatorBranches. Rules and guidelines for using our Pakistan business directory and listing services.",
  keywords: "terms of service, LocatorBranches terms, directory terms",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: `Terms of Service | ${SITE_NAME}`,
    description: "Terms of use for LocatorBranches business directory.",
    url: `${SITE_URL}/terms`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
