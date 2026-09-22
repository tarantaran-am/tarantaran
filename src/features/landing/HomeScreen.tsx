import { getCategories } from "@/shared/lib/categories";
import { Hero } from "@/features/landing/Hero";
import { BlogTeaser } from "@/features/landing/BlogTeaser";
import { Categories } from "@/features/landing/Categories";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { Inspiration } from "@/features/landing/Inspiration";
import { CTA } from "@/features/landing/CTA";

export async function HomeScreen() {
  const categories = await getCategories();

  return (
    <>
      <Hero categories={categories} />
      <Categories />
      <BlogTeaser />
      <HowItWorks />
      <Inspiration />
      <CTA />
    </>
  );
}
