import { HomePageClient } from "@/components/home-page-client";
import { fetchHomePageData } from "@/lib/fetch-home-data";

export const revalidate = 300; // Revalidate homepage data every 5 min

export default async function HomePage() {
  const { categories, featured } = await fetchHomePageData();
  return (
    <HomePageClient initialCategories={categories} initialFeatured={featured} />
  );
}
