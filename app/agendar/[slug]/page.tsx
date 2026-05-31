import { redirect } from 'next/navigation'

/** Compatibilidade: links antigos /agendar/{slug} → /{slug} */
export default async function AgendarSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const trimmed = slug?.trim()
  if (!trimmed) {
    redirect('/')
  }
  redirect(`/${trimmed}`)
}
