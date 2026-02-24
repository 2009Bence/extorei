import "./globals.css";

export const metadata = {
  title: "EXTOREI BeautySuite",
  description: "Beauty SaaS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
