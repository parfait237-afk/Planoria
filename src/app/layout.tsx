import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planoria",
  description: "Votre organisation, une longueur d’avance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
