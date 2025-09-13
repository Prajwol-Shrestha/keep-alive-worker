addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const SERVICES = [
  "https://binimaya-backend-latest.onrender.com/api/health",
  "https://manga-spot-backend.onrender.com/api",
];

async function handleRequest(request: Request): Promise<Response> {
  const results: Record<
    string,
    { status: string; data?: any; error?: string }
  > = {};

  await Promise.all(
    SERVICES.map(async (url) => {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await res.json();
          results[url] = { status: "up", data };
        } else {
          results[url] = { status: "up" };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results[url] = { status: "down", error: message };
      }
    })
  );

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
