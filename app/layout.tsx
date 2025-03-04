import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "sonner";
// import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriGrow Finance | Harvest-Cycle Microloans for Nigerian Farmers",
  description: "AgriGrow Finance connects microfinance institutions with smallholder farmers in Nigeria, providing harvest-cycle-aligned microloans with AI-powered risk assessment.",
  keywords: ["microfinance", "agriculture", "Nigeria", "farmers", "loans", "USSD", "harvest cycle"],
  authors: [{ name: "AgriGrow Finance Team" }],
  creator: "AgriGrow Finance",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://agrigrowfinance.com",
    title: "AgriGrow Finance | Harvest-Cycle Microloans for Nigerian Farmers",
    description: "Empowering Nigerian farmers with harvest-cycle-aligned microloans",
    siteName: "AgriGrow Finance",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster position="top-right" richColors />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
