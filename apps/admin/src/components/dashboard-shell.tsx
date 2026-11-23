'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPinned,
  UserRound,
  Users,
} from 'lucide-react';
import { apiGet, getErrorMessage } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/evaluations', label: 'Evaluations', icon: ClipboardList },
  { href: '/comparables', label: 'Comparables', icon: MapPinned },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => apiGet<Profile>('/users/me'),
    retry: false,
  });

  async function logout() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  useEffect(() => {
    if (me.data && me.data.data.role !== 'admin') {
      void createClient()
        .auth.signOut()
        .then(() => {
          router.replace('/login');
          router.refresh();
        });
    }
  }, [me.data, router]);

  if (me.isError) {
    return <div className="p-8 text-red-700">{getErrorMessage(me.error)}</div>;
  }

  if (me.data && me.data.data.role !== 'admin') {
    return <div className="p-8 text-slate-600">Administrator access is required.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="hidden min-h-screen flex-col bg-[#172554] text-white lg:flex">
          <div className="px-6 py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-200">Admin</p>
            <h1 className="mt-2 text-lg font-semibold">Smart Property Evaluator</h1>
          </div>
          <Suspense fallback={<SidebarNavFallback />}>
            <SidebarNav />
          </Suspense>
        </aside>
        <div>
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
            <Suspense fallback={<MobileNavFallback />}>
              <MobileNav />
            </Suspense>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{me.data?.data.full_name || 'Administrator'}</p>
                <p className="text-xs text-slate-500">{me.data?.data.email}</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" onClick={logout} type="button">
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </header>
          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          icon={link.icon}
          active={link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)}
        />
      ))}
    </nav>
  );
}

function SidebarNavFallback() {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} icon={link.icon} active={false} />
      ))}
    </nav>
  );
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto lg:hidden">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'whitespace-nowrap rounded-md px-3 py-2 text-sm',
            (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
              ? 'bg-[#172554] text-white'
              : 'text-slate-600',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileNavFallback() {
  return (
    <nav className="flex gap-2 overflow-x-auto lg:hidden">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-slate-600">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link href={href} className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm', active ? 'bg-white/10' : 'text-blue-100 hover:bg-white/5')}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
