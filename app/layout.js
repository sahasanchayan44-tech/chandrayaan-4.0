import "./globals.css";

export const metadata = {
  title: "Chandrayaan 4.0 - Mission Control Dashboard & File Hub",
  description: "Official mission control system and document hub for the Chandrayaan 4.0 lunar exploration project. Upload, view, and sync mission data 24/7.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
