import type { Metadata } from "next";
import { localizedAlternates } from "@/shared/config/seo";
import { HomeScreen } from "@/features/landing/HomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  return localizedAlternates("/");
}

export default function Home() {
  return <HomeScreen />;
}
