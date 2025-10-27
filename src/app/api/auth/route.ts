import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST() {
  const { userId, getToken } = await auth();
  const token = await getToken();
  const user = await currentUser();

  if (!userId || !token || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        clerk_id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User',
        display_name: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Unknown User'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return new Response('User created', { status: 201 });
  } catch (error) {
    return new Response('Error creating user', { status: 500 });
  }
}

export async function PUT() {
  const { userId, getToken } = await auth();
  const token = await getToken();
  const user = await currentUser();

  if (!userId || !token || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User',
        display_name: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Unknown User'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return new Response('User updated', { status: 200 });
  } catch (error) {
    return new Response('Error updating user', { status: 500 });
  }
}