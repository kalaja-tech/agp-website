import "./globals.css";

export const metadata = {
  title: "AGP Service | Elettricità e sicurezza",
  description:
    "Impianti elettrici, telecamere di sicurezza, allarmi e smart home a La Spezia e in Liguria.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
