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
        setCarpools(carpoolsData || []);
      } catch (error) {
        console.error('Error fetching carpools:', error);
      }
    }

    fetchCarpools();
  }, [user?.id, api]);

  return { carpools };
} 