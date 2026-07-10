import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { SocialProvider } from "@/components/social/SocialProvider";
import SoundInit from "@/components/SoundInit";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LetsFit — Move better, build healthier habits",
  description:
    "A student-focused wellness app for posture, movement, and consistent habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SoundInit />
          <AuthProvider>
            <SocialProvider>{children}</SocialProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
