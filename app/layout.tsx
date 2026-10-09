import './globals.css';

export const metadata = {
  title: 'Project Tracker',
  description: 'Projects, owners, deadlines and status at a glance. Built with Next.js and Postgres.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full antialiased">{children}</body>
    </html>
  );
}
