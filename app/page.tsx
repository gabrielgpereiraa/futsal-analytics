import { redirect } from 'next/navigation'

/**
 * A rota raiz redireciona sempre para /dashboard.
 * O middleware cuida da autenticação — se não estiver logado,
 * será redirecionado para /login antes de chegar aqui.
 */
export default function RootPage() {
  redirect('/dashboard')
}
