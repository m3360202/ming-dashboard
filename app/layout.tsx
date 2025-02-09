import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: '智慧树知识产权商业客户资源探测系统',
  description:
    '智慧树知识产权商业客户资源探测系统.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}
