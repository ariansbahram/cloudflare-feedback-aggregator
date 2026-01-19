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

	if (url.pathname === "/api/feedback" && request.method === "GET") {
			const { results } = await env.feedback_db
				.prepare("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50")
				.all();

			return new Response(
				JSON.stringify(results || []),
				{ headers: { "Content-Type": "application/json" } }
			);
		}

	if (url.pathname === "/summary" && request.method === "GET") {
	// Fetch recent feedback from D1
		const { results } = await env.feedback_db
			.prepare(
				"SELECT source, message FROM feedback ORDER BY created_at DESC LIMIT 10"
			)
			.all();

	if (!results || results.length === 0) {
		return new Response(
			JSON.stringify({ summary: "No feedback available yet." }),
			{ headers: { "Content-Type": "application/json" } }
		);
	}
	const feedbackText = results
		.map((row: any) => `Source: ${row.source}\nFeedback: ${row.message}`)
		.join("\n\n");

	// Call Workers AI
	const aiResponse = await env.AI.run(
		"@cf/meta/llama-3-8b-instruct",
		{
			messages: [
				{
					role: "system",
					content:
						"You are a product analyst. Summarize user feedback by identifying key themes, overall sentiment, and any urgent issues."
				},
				{
					role: "user",
					content: feedbackText
				}
			]
		}
	);

	return new Response(
		JSON.stringify({ summary: aiResponse.response }),
		{ headers: { "Content-Type": "application/json" } }
	);
}

	// Main Dashboard
		return new Response(`
<!DOCTYPE html>
<html>
<head>
	<title>Feedback Aggregator Dashboard</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
	<div class="max-w-6xl mx-auto p-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Feedback Aggregator</h1>
		<p class="text-gray-600 mb-8">AI-powered feedback analysis dashboard</p>

		<!-- Submit Feedback Form -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h2 class="text-xl font-semibold mb-4">Submit New Feedback</h2>
			<form id="feedbackForm" class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Source</label>
					<select id="source" class="w-full border border-gray-300 rounded-md px-3 py-2">
						<option value="Discord">Discord</option>
						<option value="Email">Email</option>
						<option value="Twitter">Twitter</option>
						<option value="GitHub">GitHub</option>
						<option value="Support Ticket">Support Ticket</option>
						<option value="Community Forum">Community Forum</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Feedback Message</label>
					<textarea id="message" rows="3" class="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Enter feedback..."></textarea>
				</div>
				<button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
					Submit Feedback
				</button>
			</form>
			<div id="submitMessage" class="mt-4 hidden"></div>
		</div>

		<!-- AI Summary -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold">AI Summary (Last 10 Feedbacks)</h2>
				<button id="refreshSummary" class="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm">
					Refresh
				</button>
			</div>
			<div id="aiSummary" class="text-gray-600">Click refresh to generate AI summary...</div>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Total Feedback</h3>
				<p id="totalCount" class="text-3xl font-bold text-gray-900 mt-2">0</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Top Source</h3>
				<p id="topSource" class="text-3xl font-bold text-gray-900 mt-2">-</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Recent Activity</h3>
				<p id="recentActivity" class="text-3xl font-bold text-gray-900 mt-2">-</p>
			</div>
		</div>

		<!-- Feedback Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-xl font-semibold">Recent Feedback</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
						</tr>
					</thead>
					<tbody id="feedbackTable" class="divide-y divide-gray-200">
						<tr>
							<td colspan="3" class="px-6 py-4 text-center text-gray-500">Loading...</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<script>
		// Load feedback on page load
		loadFeedback();

		// Submit feedback form
		document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
			e.preventDefault();
			const source = document.getElementById('source').value;
			const message = document.getElementById('message').value;
			
			const msgDiv = document.getElementById('submitMessage');
			
			try {
				const response = await fetch('/submit-feedback', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ source, message })
				});
				
				if (response.ok) {
					msgDiv.className = 'mt-4 p-3 bg-green-100 text-green-800 rounded-md';
					msgDiv.textContent = 'Feedback submitted successfully!';
					document.getElementById('message').value = '';
					loadFeedback();
				} else {
					throw new Error('Failed to submit');
				}
			} catch (err) {
				msgDiv.className = 'mt-4 p-3 bg-red-100 text-red-800 rounded-md';
				msgDiv.textContent = 'Error submitting feedback';
			}
			
			msgDiv.classList.remove('hidden');
			setTimeout(() => msgDiv.classList.add('hidden'), 3000);
		});

		// Load feedback data
		async function loadFeedback() {
			try {
				const response = await fetch('/api/feedback');
				const data = await response.json();
				
				// Update stats
				document.getElementById('totalCount').textContent = data.length;
				
				const sourceCounts = {};
				data.forEach(item => {
					sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
				});
				
				const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];
				document.getElementById('topSource').textContent = topSource ? topSource[0] : '-';
				
				if (data.length > 0) {
					const recent = new Date(data[0].created_at);
					const now = new Date();
					const diffMinutes = Math.floor((now - recent) / 60000);
					document.getElementById('recentActivity').textContent = diffMinutes < 60 ? 
						diffMinutes + 'm ago' : Math.floor(diffMinutes / 60) + 'h ago';
				}
				
				// Update table
				const tbody = document.getElementById('feedbackTable');
				if (data.length === 0) {
					tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">No feedback yet</td></tr>';
				} else {
					tbody.innerHTML = data.map(item => \`
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
									\${item.source}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-gray-900">\${item.message}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								\${new Date(item.created_at).toLocaleString()}
							</td>
						</tr>
					\`).join('');
				}
			} catch (err) {
				console.error('Error loading feedback:', err);
			}
		}

		// Refresh AI summary
		document.getElementById('refreshSummary').addEventListener('click', async () => {
			const summaryDiv = document.getElementById('aiSummary');
			summaryDiv.textContent = 'Generating AI summary...';
			
			try {
				const response = await fetch('/summary');
				const data = await response.json();
				summaryDiv.className = 'text-gray-700 whitespace-pre-wrap';
				summaryDiv.textContent = data.summary;
			} catch (err) {
				summaryDiv.className = 'text-red-600';
				summaryDiv.textContent = 'Error generating summary';
			}
		});
	</script>
</body>
</html>
		`, {
			headers: { "Content-Type": "text/html" }
		});

},
} satisfies ExportedHandler<Env>;
