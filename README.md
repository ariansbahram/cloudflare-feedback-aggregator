# Cloudflare Feedback Aggregator


## Overview

The prototype demonstrates how product feedback from multiple sources can be aggregated, stored, and analyzed to extract meaningful insights such as themes, sentiment, and urgent issues.

The solution includes an interactive dashboard for submitting feedback and viewing AI-powered analysis in real-time.

## How it Works

* Feedback is submitted via a web dashboard or API endpoint
* Entries are stored in a structured Cloudflare D1 database
* Workers AI analyzes feedback to identify themes, sentiment, and urgent issues
* Dashboard displays stats, recent feedback, and AI-generated summaries

## Cloudflare Products Used

* **Cloudflare Workers** - Hosts the API and frontend dashboard
* **Cloudflare D1** - Serverless SQL database for storing feedback
* **Cloudflare Workers AI** - Analyzes feedback using Llama 3 model

## Features

* **Submit Feedback** - Add feedback from multiple sources (Discord, Email, Twitter, GitHub, etc.)
* **AI Summary** - Generate AI-powered analysis of recent feedback
* **Stats Dashboard** - View total feedback count, top source, and recent activity
* **Feedback Table** - Browse all submitted feedback with timestamps

## Endpoints

* `GET /` – Interactive dashboard (main page)
* `POST /submit-feedback` – Submit feedback from any source
* `GET /api/feedback` – Retrieve all feedback entries
* `GET /summary` – AI-generated summary of recent feedback
* `GET /health` – Health check endpoint

## Live Demo

[https://feedback-aggregator.ariansbahram.workers.dev]

## Local Development
```bash
npm install
npm run dev
```

Visit `http://localhost:8787` to see the dashboard.

## Deployment
```bash
npm run deploy
```

---

**About**  
Prototype for aggregating and analyzing product feedback using Cloudflare Workers, D1, and Workers AI.
