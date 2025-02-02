// src/app/api/login/route.js

export async function POST(req) {
    const { email, password } = await req.json();
  
    try {
      const response = await fetch('http://127.0.0.1:5000/get_access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        }), { status: 200 });
      } else {
        const errorData = await response.json();
        return new Response(JSON.stringify({ error: errorData.error || 'Invalid credentials' }), { status: 401 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }
  