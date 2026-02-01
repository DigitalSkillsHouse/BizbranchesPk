"use client";

import Link from "next/link";

/**
 * SEO-optimized intro section for homepage. Targets "Pakistan free business listing directory"
 * and related LSI keywords. ~400 words, natural language, no keyword stuffing.
 */
export function SEOIntroSection() {
  return (
    <section className="w-full bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Pakistan&apos;s Free Business Listing Directory
        </h2>
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
          <p>
            BizBranches is a free business listing site for Pakistan. Whether you run a small shop in Lahore,
            a clinic in Karachi, or a restaurant in Islamabad, you can add your business free and reach more
            customers. Our directory helps people find local businesses by city and category, read reviews,
            and get contact details in one place.
          </p>
          <p>
            Finding trusted businesses in Pakistan can be time-consuming. We built this directory so you can
            search by location and service type, compare options, and contact businesses directly. Business owners
            get a free listing with contact information, address, and the chance to collect reviews from
            customers. There is no cost to list your business or to search the directory.
          </p>
          <p>
            We cover major cities including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar,
            and Quetta, as well as many smaller towns. Categories include restaurants, healthcare, education,
            retail, services, and more. You can browse by category or city, or use the search bar to find a
            specific business or service. Each listing shows the business name, category, city, phone number,
            and other details when available.
          </p>
          <p>
            If you want to grow your customer base, add your business free on BizBranches. Your listing will
            appear in search results and category pages, making it easier for people in Pakistan to discover you.
            You can update your information anytime and respond to reviews. We focus on keeping the directory
            accurate and useful for everyone.
          </p>
          <p>
            We are committed to supporting both businesses and consumers in Pakistan. Our goal is to become a
            trusted place where people find local services and where businesses get more visibility at no cost.
            Explore our categories and cities, or{" "}
            <Link href="/add" className="text-primary font-medium hover:underline">
              add your business free
            </Link>{" "}
            to get started. For questions, visit our{" "}
            <Link href="/contact" className="text-primary font-medium hover:underline">
              contact page
            </Link>{" "}
            or read our{" "}
            <Link href="/about" className="text-primary font-medium hover:underline">
              about page
            </Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
