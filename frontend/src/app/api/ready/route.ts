import { NextResponse } from 'next/server';

/**
 * Readiness check endpoint for Kubernetes readiness probe.
 * Checks if the frontend service is ready to accept traffic by verifying backend connectivity.
 */
export async function GET() {
  try {
    // Get backend URL from environment variable or use default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    // Check if backend is reachable by calling its health endpoint
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Set a timeout to avoid hanging
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'not_ready',
          service: 'todo-chatbot-frontend',
          backend: 'unreachable',
          error: `Backend returned status ${response.status}`
        },
        { status: 503 }
      );
    }

    const backendHealth = await response.json();

    return NextResponse.json({
      status: 'ready',
      service: 'todo-chatbot-frontend',
      backend: 'connected',
      backendStatus: backendHealth.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not_ready',
        service: 'todo-chatbot-frontend',
        backend: 'unreachable',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
