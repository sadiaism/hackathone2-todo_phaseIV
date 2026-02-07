import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Kubernetes liveness probe.
 * Returns 200 if the frontend service is running.
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'todo-chatbot-frontend',
    timestamp: new Date().toISOString()
  });
}
