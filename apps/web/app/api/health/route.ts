export function GET() {
  return Response.json({ status: 'web_ready' }, { headers: { 'Cache-Control': 'no-store' } });
}
