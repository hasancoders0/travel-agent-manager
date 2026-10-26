
import "./globals.css";

export const metadata = {
  title: "Travel Agent Manager",
  description: "Manage your travel agent directory.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
