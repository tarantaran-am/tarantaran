import type { Metadata } from "next";
import { StatsScreen } from "@/features/admin/stats/StatsScreen";
import { parsePeriod } from "@/features/admin/periods";

export const metadata: Metadata = { title: "Статистика" };

export default async function AdminStatsPage(props: PageProps<"/admin/stats">) {
  const { period } = await props.searchParams;
  return <StatsScreen period={parsePeriod(period)} />;
}
