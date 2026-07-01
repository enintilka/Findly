"use client";

import DashboardNav from "@/components/layout/DashboardNav";

export default function AgencyHeader({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return <DashboardNav theme="agency" title={title} subtitle={subtitle} />;
}
