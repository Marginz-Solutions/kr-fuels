export const metadata = {
  title: "KR Trans Fuels — API",
  description: "Standalone backend API for KR Trans Fuels (admin + website).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
