import { useAuth } from '@clerk/nextjs';

export const useAuthToken = () => {
  const { getToken } = useAuth();
  
  const getAuthToken = async () => {
    return await getToken({ template: "carpooly" });
  };
  console.log('Authorization Token:', getAuthToken);
  return { getAuthToken };
};

