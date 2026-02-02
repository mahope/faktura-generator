import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SharedFooter from "@/components/SharedFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gratis Faktura Generator - Opret fakturaer på dansk | GratisFaktura.dk",
  description: "Gratis dansk fakturagenerator. Opret professionelle fakturaer med moms, download som PDF. Ingen login, ingen betaling. Perfekt til freelancere og små virksomheder.",
  keywords: "faktura generator, gratis faktura, dansk faktura, fakturaskabelon, opret faktura, faktura pdf, moms faktura, freelance faktura, cvr faktura",
  authors: [{ name: "GratisFaktura.dk" }],
  openGraph: {
    title: "Gratis Faktura Generator - Opret fakturaer på dansk",
    description: "Opret professionelle fakturaer med moms og download som PDF. Helt gratis, ingen login.",
    type: "website",
    locale: "da_DK",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <head>
        <link rel="canonical" href="https://gratisfaktura.dk" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Gratis Faktura Generator",
              "description": "Gratis dansk fakturagenerator til freelancere og små virksomheder",
              "url": "https://gratisfaktura.dk",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "DKK"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <SharedFooter />
      </body>
    </html>
  );
}
