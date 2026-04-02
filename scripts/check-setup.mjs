#!/usr/bin/env node
/**
 * Futsal Analytics V0.1 — Setup Checklist
 * Execute: node scripts/check-setup.mjs
 */

import { existsSync } from 'fs'
import { resolve } from 'path'

const root = process.cwd()

function check(label, condition) {
  const icon = condition ? '✅' : '❌'
  console.log(`${icon}  ${label}`)
  return condition
}

console.log('\n🔍 Futsal Analytics V0.1 — Setup Checklist\n')

// Env
const envExists = existsSync(resolve(root, '.env.local'))
check('.env.local existe', envExists)

if (envExists) {
  const { readFileSync } = await import('fs')
  const env = readFileSync(resolve(root, '.env.local'), 'utf-8')
  check('NEXT_PUBLIC_SUPABASE_URL configurada',   env.includes('NEXT_PUBLIC_SUPABASE_URL=https://'))
  check('NEXT_PUBLIC_SUPABASE_ANON_KEY configurada', env.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ'))
}

// shadcn components
const uiComponents = [
  'alert', 'alert-dialog', 'badge', 'button', 'card',
  'input', 'label', 'progress', 'select', 'separator',
  'slider', 'switch', 'textarea', 'toast', 'tooltip',
]

console.log('\n📦 Componentes shadcn/ui:')
const missingComponents = []
for (const comp of uiComponents) {
  const exists = existsSync(resolve(root, `components/ui/${comp}.tsx`))
  check(`  components/ui/${comp}.tsx`, exists)
  if (!exists) missingComponents.push(comp)
}

// node_modules
check('\nnode_modules instalado', existsSync(resolve(root, 'node_modules')))
check('@supabase/ssr instalado',
  existsSync(resolve(root, 'node_modules/@supabase/ssr')))
check('react-hook-form instalado',
  existsSync(resolve(root, 'node_modules/react-hook-form')))
check('zod instalado',
  existsSync(resolve(root, 'node_modules/zod')))

// Sumário
console.log('\n─────────────────────────────────────────')
if (missingComponents.length > 0) {
  console.log('\n⚠️  Componentes shadcn faltando. Execute:\n')
  console.log(`npx shadcn@latest add ${missingComponents.join(' ')}\n`)
} else {
  console.log('\n🎉 Tudo pronto! Execute: npm run dev\n')
}
