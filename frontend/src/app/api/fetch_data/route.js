// src/app/api/fetch_data/route.js

export async function GET(req) {
    const accessToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  
    try {
      const response = await fetch('http://127.0.0.1:5000/fetch_data', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: response.status });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }
  