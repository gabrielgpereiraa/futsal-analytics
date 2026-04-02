import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <Sidebar userEmail={user.email ?? ''} userName={profile?.full_name ?? null} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
