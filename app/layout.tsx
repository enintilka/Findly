import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CustomerAuthProvider } from "@/components/customer/CustomerAuthProvider";
import { AgencyAuthProvider } from "@/components/agency/AgencyAuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Findly — The reverse property marketplace",
  description:
    "Describe your ideal property and let real estate agencies come to you. Findly puts customer demand first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CustomerAuthProvider>
          <AgencyAuthProvider>
            <AuthProvider>{children}</AuthProvider>
          </AgencyAuthProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
