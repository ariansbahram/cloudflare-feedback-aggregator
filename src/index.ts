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
		let body;
		try {
			body = await request.json();
		} catch {
			return new Response(
				JSON.stringify({ error: "Invalid JSON body" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const { source, message } = body;

		if (!source || !message) {
			return new Response(
				JSON.stringify({ error: "Missing source or message" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		await env.feedback_db
			.prepare(
				"INSERT INTO feedback (source, message, created_at) VALUES (?, ?, ?)"
			)
			.bind(source, message, new Date().toISOString())
			.run();

  		return new Response(
			JSON.stringify({ success: true }),
			{ headers: { "Content-Type": "application/json" } }
		);
	}

	return new Response("Feedback Aggregator API", { status: 200 });

},
} satisfies ExportedHandler<Env>;
