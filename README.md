# Cloudflare Feedback Aggregator

This project is a prototype built for the Cloudflare Product Manager Intern assignment.

## Overview
The prototype demonstrates how product feedback from multiple sources can be aggregated, stored, and analyzed to extract meaningful insights such as themes, sentiment, and urgent issues.

The focus of this project is on the feedback ingestion and analysis workflow rather than UI polish or third-party integrations.

## How it Works
- Feedback is submitted via a simple API endpoint.
- Entries are stored in a structured Cloudflare D1 database.
- A summary endpoint uses Cloudflare Workers AI to analyze recent feedback and return themes, sentiment, and urgency.

## Cloudflare Products Used
- Cloudflare Workers
- Cloudflare D1
- Cloudflare Workers AI

## Endpoints
- `POST /submit-feedback` – Submit feedback from any source
- `GET /summary` – Retrieve an AI-generated summary of recent feedback
- `GET /health` – Health check endpoint
