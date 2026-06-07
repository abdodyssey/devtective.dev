import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "M. Abdi Nugroho",
    template: "%s · Abdi Nugroho",
  },
  description:
    "Membuat hal-hal yang bermanfaat bagi orang lain maupun diri sendiri, serta menuangkan ide-ide kreatif melalui teknologi.",
  metadataBase: new URL("https://devtective.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devtective.dev",
    siteName: "Devtective",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased scroll-smooth scroll-pt-16`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-bg-primary text-text-secondary font-sans selection:bg-accent-tint selection:text-accent"
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
