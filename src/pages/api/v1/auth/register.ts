import type { APIRoute } from 'astro';
import { RegisterSchema } from '@/lib/validators/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json();

  const parseResult = RegisterSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: parseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const { email, password } = parseResult.data;

  const { supabase } = locals;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/login`,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  // Ensure no active session remains for unverified users
  await supabase.auth.signOut();

  return new Response(
    JSON.stringify({
      message:
        'Registration successful. Please check your email for a confirmation link.',
    }),
    { status: 200 }
  );
};
