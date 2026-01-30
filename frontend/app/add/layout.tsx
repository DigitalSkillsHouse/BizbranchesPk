import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "List Your Business - Free Global Business Directory Listing | BizDirectory",
  description: "Add your business to the world's premier business directory. Free business listing with instant visibility to millions of customers worldwide. List restaurants, services, shops and more.",
  keywords: "business listing, free business directory, add business, global business directory, business registration, international business directory, business promotion, worldwide business listing",
  openGraph: {
    title: "List Your Business - Free Global Business Directory Listing",
    description: "Add your business to the world's premier business directory. Free listing with instant visibility worldwide.",
    type: "website",
  },
  alternates: {
    canonical: "/add"
  }
}

export default function AddLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}