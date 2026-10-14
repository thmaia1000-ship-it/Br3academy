export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('return_to') || '/';

  return new Response(null, {
    status: 302,
    headers: {
      Location: returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/',
      'Set-Cookie': 'br3_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
    },
  });
}
