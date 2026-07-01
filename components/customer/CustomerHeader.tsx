"use client";

import DashboardNav from "@/components/layout/DashboardNav";

export default function CustomerHeader({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <DashboardNav theme="customer" title={title} subtitle={subtitle} />
  );
}
