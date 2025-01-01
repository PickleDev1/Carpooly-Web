import { auth } from '@clerk/nextjs/server';

export const getAuthToken = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  console.log('Authorization Token:', token);
  return token;
};
