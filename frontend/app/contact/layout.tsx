import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contact Us - ${SITE_NAME}`,
  description:
    "Contact LocatorBranches for business listing inquiries and support. Email us for help with your listing or general questions about our Pakistan business directory.",
  keywords: "contact LocatorBranches, business listing support, directory contact",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: `Contact Us | ${SITE_NAME}`,
    description: "Get in touch for business listing and support.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
  twitter: { card: "summary", title: `Contact | ${SITE_NAME}` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
