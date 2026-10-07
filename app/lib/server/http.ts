// lib/server/http.ts
// Turns unexpected server failures into clear JSON errors the app can show,
// instead of a bare 500 that the UI can only describe as "something went wrong".

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("API error:", message);
  if (/DATABASE_URL/.test(message)) {
    return Response.json(
      { error: "The app’s database isn’t connected yet. Add a Neon database to the Vercel project (Storage tab), then redeploy.", code: "db_not_configured" },
      { status: 503 }
    );
  }
  if (/ECONNREFUSED|ENOTFOUND|password authentication|connect|fetch failed|getaddrinfo/i.test(message)) {
    return Response.json(
      { error: "The app can’t reach its database right now. Check DATABASE_URL in Vercel and try again.", code: "db_unreachable" },
      { status: 503 }
    );
  }
  return Response.json({ error: "The server hit a problem. Please try again in a moment.", code: "server_error" }, { status: 500 });
}

/** Wrap a route handler so any thrown error becomes a readable JSON response. */
export function handle<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      return serverError(error);
    }
  };
}
