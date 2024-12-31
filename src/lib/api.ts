import { auth } from '@clerk/nextjs';

export async function fetchCarpools() {
  const { getToken } = auth();
  const token = await getToken();

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/carpools`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch carpools');
  }

  return response.json();
} 