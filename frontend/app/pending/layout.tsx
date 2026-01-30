import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Pending Listings - ${SITE_NAME}`,
  description: "View your pending business submissions on LocatorBranches. Track listing status and approvals.",
  alternates: { canonical: `${SITE_URL}/pending` },
  robots: { index: false, follow: true },
};

export default function PendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
