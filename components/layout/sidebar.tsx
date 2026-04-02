'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  UserCircle2,
  Clapperboard,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  userEmail: string
  userName: string | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/teams',     label: 'Times',       icon: Users },
  { href: '/players',   label: 'Jogadores',   icon: UserCircle2 },
  { href: '/matches',   label: 'Partidas',    icon: Clapperboard },
]

export function Sidebar({ userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <p className="text-sm font-bold tracking-tight text-foreground">
          ⚽ Futsal Analytics
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 space-y-2">
        <p className="text-xs text-muted-foreground truncate">
          {userName ?? userEmail}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground px-0"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
