import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const font = Nunito({ subsets: ["latin"], variable: "--font" });
export const metadata: Metadata = {
  title: "TUMart",
  description: "Buy and sell items on campus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className={font.className}>
        <Navbar/>
            <main>{children}</main>
      </body>
    </html>
  );
}
