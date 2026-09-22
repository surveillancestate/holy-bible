// KJV Bible API Server with Bun
import { serve } from 'bun';

interface OAuthCallbackRequest {
  code: string;
  state: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'local';
}

// Mock user database (replace with real database in production)
const users = new Map<string, User>();
const tokens = new Map<string, string>();

// Generate a simple JWT-like token (use proper JWT library in production)
function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString('base64');
  const signature = Buffer.from(`${header}.${payload}.secret`).toString('base64');
  return `${header}.${payload}.${signature}`;
}

// Exchange OAuth code for user info (mock implementation)
async function exchangeOAuthCode(provider: 'google' | 'github', code: string): Promise<User> {
  // In production, you would:
  // 1. Send the code to the provider's token endpoint
  // 2. Get the access token
  // 3. Use the access token to fetch user info
  
  // Mock implementation
  const mockUser: User = {
    id: `user_${Date.now()}`,
    email: `user@example.com`,
    name: provider === 'google' ? 'Google User' : 'GitHub User',
    avatar: undefined,
    provider: provider,
  };

  // In production, fetch real user data from provider
  if (provider === 'google') {
    // const response = await fetch('https://oauth2.googleapis.com/token', { ... });
    // const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { ... });
  } else if (provider === 'github') {
    // const response = await fetch('https://github.com/login/oauth/access_token', { ... });
    // const userInfo = await fetch('https://api.github.com/user', { ... });
  }

  return mockUser;
}

const server = serve({
  port: Bun.env.PORT || 3000,
  
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static files from public directory
    if (path === '/' || path === '/index.html') {
      try {
        const file = Bun.file('./public/index.html');
        return new Response(file, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }

    // Serve CSS files
    if (path.startsWith('/src/styles/')) {
      try {
        const file = Bun.file(`.${path}`);
        return new Response(file, {
          headers: { 'Content-Type': 'text/css' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }

    // Serve TypeScript/JavaScript files
    if (path.startsWith('/src/components/') || path.startsWith('/src/data/') || path.startsWith('/src/auth/')) {
      try {
        const file = Bun.file(`.${path.replace('.ts', '.js')}`);
        return new Response(file, {
          headers: { 'Content-Type': 'application/javascript' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }

    // API Routes
    if (path.startsWith('/api/')) {
      return handleApiRequest(req, path, corsHeaders);
    }

    // Default: serve index.html for SPA routing
    try {
      const file = Bun.file('./public/index.html');
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  },
});

async function handleApiRequest(req: Request, path: string, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // POST /api/auth/callback - Handle OAuth callback
    if (path === '/api/auth/callback' && req.method === 'POST') {
      const body: OAuthCallbackRequest = await req.json();
      const { code, state } = body;

      // Validate state (prevent CSRF)
      // In production, verify state matches what was sent in the OAuth request

      // Determine provider from code or add as parameter
      const provider: 'google' | 'github' = 'google'; // Simplified for demo

      // Exchange code for user info
      const user = await exchangeOAuthCode(provider, code);

      // Store user and generate token
      users.set(user.id, user);
      const token = generateToken(user.id);
      tokens.set(token, user.id);

      return Response.json({ user, token }, { headers: corsHeaders });
    }

    // GET /api/user/me - Get current user
    if (path === '/api/user/me' && req.method === 'GET') {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const token = authHeader.split(' ')[1];
      const userId = tokens.get(token);

      if (!userId) {
        return Response.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders });
      }

      const user = users.get(userId);
      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }

      return Response.json({ user }, { headers: corsHeaders });
    }

    // GET /api/bible/:book/:chapter - Get Bible chapter
    if (path.match(/^\/api\/bible\/[^/]+\/\d+$/) && req.method === 'GET') {
      const parts = path.split('/');
      const book = decodeURIComponent(parts[3]);
      const chapter = parseInt(parts[4], 10);

      // In production, fetch from Bible text database
      // For now, return mock data
      return Response.json({
        book,
        chapter,
        verses: [
          { verse: 1, text: 'In the beginning God created the heaven and the earth.' },
          { verse: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
          // Add more verses as needed
        ],
      }, { headers: corsHeaders });
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

console.log(`📖 KJV Bible server running at http://localhost:${server.port}`);
