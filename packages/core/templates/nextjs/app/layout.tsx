import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '__CT_PROJECT_NAME__',
  description: 'Built with CodersTrim and Next.js 16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {/* @CodersTrim-Inject-Providers */}
        {children}
      </body>
    </html>
  );
}
