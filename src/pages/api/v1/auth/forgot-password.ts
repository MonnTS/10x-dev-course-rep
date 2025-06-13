import type { APIRoute } from 'astro';
import { ForgotPasswordSchema } from '@/lib/validators/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json();

  const parseResult = ForgotPasswordSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: parseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const { email } = parseResult.data;
  const { supabase } = locals;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}/forgot-password`,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(null, { status: 200 });
};
