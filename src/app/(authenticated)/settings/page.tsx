'use client'

import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApi } from '@/services/api';
import Link from 'next/link';
import { 
  Bell, 
  MapPin, 
  Shield, 
  User, 
  Download, 
  Trash2, 
  HelpCircle, 
  FileText, 
  ExternalLink,
  Settings,
  Mail,
  Smartphone,
  Clock,
  Eye,
  Home,
  Building,
  Database,
  History,
  AlertTriangle
} from 'lucide-react';

// Helper function for reverse geocoding
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return `${lat}, ${lng}`;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${lat}, ${lng}`;
  } catch (e) {
    return `${lat}, ${lng}`;
  }
}

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const api = useApi();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [milesSaved, setMilesSaved] = useState(0);
  
  // Location and privacy state
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);
  const [homeAddress, setHomeAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch miles saved for account status
  useEffect(() => {
    const fetchMilesSaved = async () => {
      if (!user?.id) return;
      
      try {
        const calculatedMilesSaved = await api.calculateMilesSaved(user.id);
        setMilesSaved(calculatedMilesSaved);
      } catch (error) {
        console.error('Error calculating miles saved:', error);
      }
    };

    fetchMilesSaved();
  }, [user?.id, api]);

  // Fetch location settings and user data
  useEffect(() => {
    const fetchLocationSettings = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch location settings
        const locationSettings = await api.getLocationSettings();
        setLocationSharingEnabled(locationSettings.location_sharing_enabled || false);
        
        // Fetch user data to get home address
        const userData = await api.getUserById(user.id);
        
        // Extract home address from user data
        if (userData.home_address) {
          setHomeAddress(userData.home_address);
        } else if (userData.home_latitude && userData.home_longitude) {
          // If we have coordinates but no address, we could reverse geocode here
          // For now, just show coordinates
          const lat = userData.home_latitude.Float64 !== undefined ? userData.home_latitude.Float64 : userData.home_latitude;
          const lng = userData.home_longitude.Float64 !== undefined ? userData.home_longitude.Float64 : userData.home_longitude;
          // Use reverse geocoding to get a human-readable address
          const address = await reverseGeocode(lat, lng);
          setHomeAddress(address);
        }
        
      } catch (error) {
        console.error('Error fetching location settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationSettings();
  }, [user?.id, api]);

  const handleSaveLocationSettings = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Update location settings
      await api.updateLocationSettings(locationSharingEnabled);
      
      // Update user data if home address has changed
      // Note: This assumes the backend supports updating home_address field
      // If not, you may need to implement a separate endpoint
      try {
        await api.updateUser(user.id, {
          home_address: homeAddress
        });
      } catch (userUpdateError) {
        console.warn('Could not update home address:', userUpdateError);
        // Don't fail the entire save operation if user update fails
      }
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving location settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsDeleting(true);
    try {
      // Call the delete user API
      await api.deleteUser(user.id);
      
      // Sign out the user
      await signOut();
      
      // Redirect to login page
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications Section */}
            <Card className="p-6 border-0 shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-500">Manage how you receive updates and alerts</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900">Email notifications</span>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900">Push notifications</span>
                      <p className="text-sm text-gray-500">Get instant alerts on your device</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900">Ride reminders</span>
                      <p className="text-sm text-gray-500">Get notified before your rides</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            {/* Location & Privacy Section */}
            <Card className="p-6 border-0 shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Location & Privacy</h2>
                  <p className="text-sm text-gray-500">Control your location sharing and privacy settings</p>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading-spinner h-8 w-8 mx-auto"></div>
                  <span className="ml-3 text-gray-600">Loading settings...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-900">Location sharing</span>
                        <p className="text-sm text-gray-500">Share your location during rides</p>
                      </div>
                    </div>
                    <Switch 
                      checked={locationSharingEnabled}
                      onCheckedChange={setLocationSharingEnabled}
                    />
                  </div>
                  
                  <div className="p-4 rounded-lg border border-gray-100">
                    <Label htmlFor="home-address" className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      Home Address
                    </Label>
                    <Input 
                      id="home-address" 
                      placeholder="Enter your home address" 
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className="border-gray-200 focus:border-primary focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This address is fetched from your profile and can be updated here.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-900">Profile visibility</span>
                        <p className="text-sm text-gray-500">Show my profile to other users</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  {/* Save Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button
                      onClick={handleSaveLocationSettings}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                    {saveMessage && (
                      <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {saveMessage}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Account Management Section */}
            <Card className="p-6 border-0 shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Account Management</h2>
                  <p className="text-sm text-gray-500">Manage your account data and preferences</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Delete Account</div>
                    <div className="text-sm text-red-500">Permanently remove your account</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* App Info & Support Section */}
            <Card className="p-6 border-0 shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Support</h2>
                  <p className="text-sm text-gray-500">Get help and learn more</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link 
                  href="/support" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                  <span className="font-medium text-gray-900 group-hover:text-primary">Help & Support</span>
                </Link>
                
                <Link 
                  href="/privacy-policy" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Shield className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                  <span className="font-medium text-gray-900 group-hover:text-primary">Privacy Policy</span>
                </Link>
                
                <Link 
                  href="/terms" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                  <span className="font-medium text-gray-900 group-hover:text-primary">Terms of Service</span>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">App Version</span>
                  <Badge variant="secondary" className="text-xs">v1.0.0</Badge>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 border-0 shadow-sm bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Miles Saved</span>
                  <span className="text-sm font-medium text-gray-900">{milesSaved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="default" className="text-xs">Active</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Delete Account</DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, including:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>All your ride history and carpool data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>Your profile information and preferences</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>All saved locations and addresses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>Your account settings and notifications</span>
            </div>
          </div>
          
          <DialogFooter className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 