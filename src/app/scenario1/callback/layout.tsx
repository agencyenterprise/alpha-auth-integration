'use client';

import { AuthProvider } from '../../../providers/authProvider';

export default function CallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
} 