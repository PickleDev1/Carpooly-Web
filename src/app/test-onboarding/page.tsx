"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('🧪 Test Onboarding Page: Page loaded');
    console.log('🧪 Test Onboarding Page: User agent:', navigator.userAgent);
    console.log('🧪 Test Onboarding Page: Is mobile:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    // Test different navigation methods
    const testNavigation = () => {
      console.log('🧪 Test Onboarding Page: Testing navigation methods...');
      
      // Method 1: Router push
      console.log('🧪 Test Onboarding Page: Attempting router.push to onboarding');
      router.push('/onboarding');
      
      // Method 2: Window location (fallback)
      setTimeout(() => {
        console.log('🧪 Test Onboarding Page: Attempting window.location.href to onboarding');
        window.location.href = '/onboarding';
      }, 2000);
    };

    // Auto-test after 1 second
    setTimeout(testNavigation, 1000);
  }, [router]);

  return (
    <div className="container mx-auto mt-16 p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Onboarding Navigation</h1>
      <p className="mb-4">This page tests navigation to the onboarding page.</p>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Device Info:</h2>
          <p>User Agent: {navigator.userAgent}</p>
          <p>Is Mobile: {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Yes' : 'No'}</p>
          <p>Is iOS: {/iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Manual Navigation:</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('🧪 Test Onboarding Page: Manual router.push');
                router.push('/onboarding');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Router Push to Onboarding
            </button>
            
            <button
              onClick={() => {
                console.log('🧪 Test Onboarding Page: Manual window.location');
                window.location.href = '/onboarding';
              }}
              className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            >
              Window Location to Onboarding
            </button>
            
            <button
              onClick={() => {
                console.log('🧪 Test Onboarding Page: Manual window.location.replace');
                window.location.replace('/onboarding');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            >
              Window Location Replace to Onboarding
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Other Pages:</h2>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 