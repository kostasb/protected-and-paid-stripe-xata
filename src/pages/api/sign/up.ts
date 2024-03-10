import { generateId } from 'lucia'
import { lucia } from '@/lucia/index'
import { getXataClient } from '@/xata'
import type { APIContext } from 'astro'
import { Argon2id } from 'oslo/password'

export async function POST(context: APIContext): Promise<Response> {
  const xata = getXataClient()
  const user_id = generateId(15)
  const formData = await context.request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const hashed_password = await new Argon2id().hash(password)
  const existingRecord = await xata.db.user.filter('email', email).getFirst()
  if (existingRecord) return context.redirect('/signin')
  await xata.db.user.create({ email, user_id, hashed_password })
  const session = await lucia.createSession(user_id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return context.redirect('/')
}
