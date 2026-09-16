import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import MoneyCursor from "./components/MoneyCursor";
import ShellWrapper from "./components/ShellWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
        className={jakarta.className}
        style={{ backgroundColor: "#F8F4EE" }}
      >
        <MoneyCursor />
        <ShellWrapper>{children}</ShellWrapper>
      </body>
    </html>
  );
}