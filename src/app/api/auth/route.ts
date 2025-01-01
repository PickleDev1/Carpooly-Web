import { auth } from '@clerk/nextjs/server';

export async function POST() {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clerk_id: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return new Response('User created', { status: 201 });
  } catch (error) {
    return new Response('Error creating user', { status: 500 });
  }
}