const SERVICES = [
  "https://binimaya-backend-latest.onrender.com/api/health",
  "https://manga-spot-backend.onrender.com/api",
];

interface Env {}

async function pingServices() {
  const results: Record<string, any> = {};

  await Promise.all(
    SERVICES.map(async (url) => {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          const data = await res.json();
          results[url] = { status: "up", data };
        } else {
          results[url] = { status: "up", message: "Non-JSON response" };
        }
      } catch (err: any) {
        results[url] = { status: "down", error: err.message };
      }
    })
  );

  return results;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const results = await pingServices();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    await pingServices();
    console.log("Cron job executed at", new Date().toISOString());
  },
};
