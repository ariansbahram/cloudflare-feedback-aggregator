/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

  	if (url.pathname === "/health") {
		return new Response(
			JSON.stringify({ status: "ok" }),
      		{ headers: { "Content-Type": "application/json" } }
    	);
  	}

	if (url.pathname === "/submit-feedback" && request.method === "POST") {
		const body = await request.json();
		// Body should contain { source, message }
		// Not storing data yet
		return new Response(
			JSON.stringify({ success: true }),
			{ headers: { "Content-Type": "application/json" } }
		);
	}

  	return new Response("Feedback Aggregator API", { status: 200 });

	},
} satisfies ExportedHandler<Env>;
