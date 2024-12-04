import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { Providers } from "@/components/providers";
import Loading from "./loading";
import { Suspense } from "react";
import { Toaster } from 'sonner'
import ProductProvider from "./contexts/ProductsContext";


const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mkhasa",
  description: "Welcome to mkhasa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Providers>
          <ProductProvider>
            <Toaster position="top-right" expand visibleToasts={1} richColors={true} closeButton />
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </ProductProvider>
        </Providers>
      </body>
    </html>
  );
}
