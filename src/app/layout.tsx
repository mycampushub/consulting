import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduSaaS - Education Agency Management Platform",
  description: "Complete white-label SaaS platform for education agencies. Manage international student recruitment, university partnerships, and marketing automation.",
  keywords: ["EduSaaS", "Education Agency", "Student Management", "University Partnerships", "Marketing Automation", "CRM"],
  authors: [{ name: "EduSaaS Team" }],
  openGraph: {
    title: "EduSaaS - Education Agency Management Platform",
    description: "Complete white-label SaaS platform for education agencies. Manage international student recruitment, university partnerships, and marketing automation.",
    url: "https://edusaas.com",
    siteName: "EduSaaS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduSaaS - Education Agency Management Platform",
    description: "Complete white-label SaaS platform for education agencies",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
