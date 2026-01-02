'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import type { Carpool } from '@/types/api'

export function useCarpools() {
  const [carpools, setCarpools] = useState<Carpool[]>([])
  const { user } = useUser()
  const api = useApi()

  useEffect(() => {
    async function fetchCarpools() {
      if (!user?.id) return;

      try {
        console.log('Fetching carpools for user:', user.id);
        const carpoolsData = await api.getCarpools(user.id);
        console.log('Carpools data received:', carpoolsData);
        // Handle both array and object with data property
        const carpoolsArray = Array.isArray(carpoolsData) ? carpoolsData : (carpoolsData?.data || []);
        
        // Process carpools to handle nested objects with String/Valid structure
        const processedCarpools = carpoolsArray.map((carpool: any) => {
          // Helper function to safely extract string values from nested objects
          const safeString = (value: any): string => {
            if (typeof value === 'string') return value;
            if (value && typeof value === 'object' && 'String' in value && 'Valid' in value) {
              return value.Valid ? value.String : '';
            }
            return String(value || '');
          };
          
          return {
            ...carpool,
            carpool_name: safeString(carpool.carpool_name),
            recurring_option: safeString(carpool.recurring_option),
            destination_address: safeString(carpool.destination_address)
          };
        });
        
        setCarpools(processedCarpools);
      } catch (error) {
        console.error('Error fetching carpools:', error);
        // Set empty array on error to prevent UI breakage
        setCarpools([]);
      }
    }

    fetchCarpools();
  }, [user?.id, api]);

  const deleteCarpool = async (carpoolId: string) => {
    try {
      await api.deleteCarpool(carpoolId);
      // Update local state by removing the deleted carpool
      setCarpools(prevCarpools => prevCarpools.filter(carpool => carpool.id !== carpoolId));
      return true;
    } catch (error) {
      console.error('Error deleting carpool:', error);
      throw error;
    }
  };

  return { carpools, deleteCarpool };
} 