'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, clearTokens } from '../../utils/auth';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch('/api/fetch_data', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else if (res.status === 401) {
          clearTokens();
          router.push('/');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push('/');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
      >
        Logout
      </button>

      <div className="mt-4">
        {data ? (
          <pre className="bg-gray-200 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </div>
  );
}
