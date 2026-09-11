import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import MoneyCursor from "./components/MoneyCursor";
import ShellWrapper from "./components/ShellWrapper";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kasir Admin",
  description: "Aplikasi kasir untuk mini project magang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={quicksand.className}
        style={{
          backgroundImage: "url('/kasir-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundColor: "#FFFDF5",
        }}
      >
        <MoneyCursor />
        <ShellWrapper>{children}</ShellWrapper>
      </body>
    </html>
  );
}