import { redirect } from 'next/navigation'

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : ''

  redirect(`/auth/login${redirectTo}`)
}
