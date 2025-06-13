import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@/db/supabase/server';

const protectedPaths = ['/flashcards', '/generate'];
const authPaths = ['/login', '/register', '/forgot-password'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect } = context;
  const supabase = createSupabaseServerClient({
    cookies,
    headers: request.headers,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  context.locals.supabase = supabase;
  context.locals.user = (await supabase.auth.getUser()).data.user;

  if (protectedPaths.includes(url.pathname) && !session) {
    return redirect('/login');
  }

  if (authPaths.includes(url.pathname) && session) {
    return redirect('/flashcards');
  }

  if (url.pathname === '/') {
    return session ? redirect('/flashcards') : redirect('/login');
  }

  return next();
});
