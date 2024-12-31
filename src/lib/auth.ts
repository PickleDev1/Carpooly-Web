import { useAuth } from '@clerk/nextjs';

export const getAuthToken = async () => {
  const { getToken } = useAuth();
  const token = await getToken();
  console.log('Authorization Token:', token);
  return token;
};