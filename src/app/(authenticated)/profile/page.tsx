'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApi } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Car, 
  Award,
  Edit3,
  Save,
  X,
  Camera,
  Phone,
  CreditCard,
  Trees,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function ProfilePage() {
  const { user } = useUser();
  const api = useApi();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAdditional, setIsEditingAdditional] = useState(false);
  const [editedName, setEditedName] = useState(user?.firstName || '');
  const [editedEmail, setEditedEmail] = useState(user?.emailAddresses[0]?.emailAddress || '');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Additional info state
  const [additionalInfo, setAdditionalInfo] = useState({
    phoneNumber: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    preferredRole: 'Driver',
    driverLicenseStatus: 'Verified',
    vehicleInfo: 'Toyota Camry 2020',
    bio: 'I love carpooling and meeting new people!'
  });

  const [editedAdditionalInfo, setEditedAdditionalInfo] = useState(additionalInfo);
  const [isUpdatingClerkData, setIsUpdatingClerkData] = useState(false);

  // Stats and Activity state
  const [userStats, setUserStats] = useState({
    totalRides: 0,
    totalCarpools: 0,
    milesSaved: 0,
    memberSince: '',
    rating: 0,
    completedRides: 0,
    cancelledRides: 0
  });

  const recentActivity = [
    { type: 'ride', action: 'Joined carpool', date: '2024-01-20', details: 'Work commute - 8:00 AM' },
    { type: 'carpool', action: 'Created carpool', date: '2024-01-18', details: 'Weekend trip to beach' },
    { type: 'rating', action: 'Received 5-star rating', date: '2024-01-15', details: 'From Sarah M.' },
    { type: 'ride', action: 'Completed ride', date: '2024-01-12', details: 'Airport pickup' }
  ];

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await api.getUserById(user.id);
        setUserData(data);
        console.log('User data fetched:', data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id, api]);

  // Fetch miles saved and other stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const calculatedMilesSaved = await api.calculateMilesSaved(user.id);
        setUserStats(prev => ({
          ...prev,
          milesSaved: calculatedMilesSaved
        }));
      } catch (error) {
        console.error('Error calculating miles saved:', error);
      }
    };

    fetchStats();
  }, [user?.id, api]);

  const handleSave = async () => {
    // TODO: Implement profile update logic
    console.log('Saving profile changes...');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.firstName || '');
    setEditedEmail(user?.emailAddresses[0]?.emailAddress || '');
    setIsEditing(false);
  };

  const handleSaveAdditional = async () => {
    // TODO: Implement additional info update logic
    console.log('Saving additional info changes...', editedAdditionalInfo);
    setAdditionalInfo(editedAdditionalInfo);
    setIsEditingAdditional(false);
  };

  const handleCancelAdditional = () => {
    setEditedAdditionalInfo(additionalInfo);
    setIsEditingAdditional(false);
  };

  const handleUpdateClerkData = async () => {
    setIsUpdatingClerkData(true);
    try {
      await api.updateUserWithClerkData();
      // Refresh user data by refetching
      const data = await api.getUserById(user?.id || '');
      setUserData(data);
      showToast("Your profile has been updated with your Clerk information.");
    } catch (error) {
      console.error('Failed to update user with Clerk data:', error);
      showToast("Failed to update your profile with Clerk information.");
    } finally {
      setIsUpdatingClerkData(false);
    }
  };

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'default';
      case 'Pending': return 'secondary';
      case 'Expired': return 'destructive';
      default: return 'outline';
    }
  };

  const formatMemberSince = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-10 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-primary">
                    <Camera className="w-4 h-4 text-primary" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-2">
                {isEditing ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-center"
                  />
                ) : (
                  user?.firstName + ' ' + (user?.lastName || '')
                )}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {isEditing ? (
                  <Input
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    type="email"
                    className="text-center"
                  />
                ) : (
                  user?.emailAddresses[0]?.emailAddress
                )}
              </p>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Trees className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">{Math.round(userStats.milesSaved / 50)} Trees Saved</span>
              </div>

              <div className="text-sm text-gray-500">
                Member since {formatMemberSince(userData?.created_at || '')}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave} size="sm" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
              
              {/* Update Clerk Data Button */}
              {!isEditing && (
                <div className="mt-4">
                  <Button 
                    onClick={handleUpdateClerkData} 
                    disabled={isUpdatingClerkData}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    {isUpdatingClerkData ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Update Profile from Clerk
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userStats.totalRides}</div>
              <div className="text-sm text-gray-600">Total Rides</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userStats.totalCarpools}</div>
              <div className="text-sm text-gray-600">Carpools Created</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userStats.milesSaved}</div>
              <div className="text-sm text-gray-600">Miles Saved</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userStats.completedRides}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.type === 'ride' && <Car className="w-4 h-4 text-primary" />}
                    {activity.type === 'carpool' && <MapPin className="w-4 h-4 text-primary" />}
                    {activity.type === 'rating' && <Award className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.action}</div>
                    <div className="text-xs text-gray-600">{activity.details}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Additional Info */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <Button
                onClick={() => setIsEditingAdditional(!isEditingAdditional)}
                variant={isEditingAdditional ? "outline" : "default"}
                size="sm"
                className="flex items-center gap-2"
              >
                {isEditingAdditional ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditingAdditional ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                {isEditingAdditional ? (
                  <Input
                    value={editedAdditionalInfo.phoneNumber}
                    onChange={(e) => setEditedAdditionalInfo({...editedAdditionalInfo, phoneNumber: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{additionalInfo.phoneNumber}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                {isEditingAdditional ? (
                  <Input
                    value={editedAdditionalInfo.location}
                    onChange={(e) => setEditedAdditionalInfo({...editedAdditionalInfo, location: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{additionalInfo.location}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Preferred Role
                </Label>
                {isEditingAdditional ? (
                  <select
                    value={editedAdditionalInfo.preferredRole}
                    onChange={(e) => setEditedAdditionalInfo({...editedAdditionalInfo, preferredRole: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Driver">Driver</option>
                    <option value="Passenger">Passenger</option>
                    <option value="Both">Both</option>
                  </select>
                ) : (
                  <Badge variant="secondary" className="mt-1">{additionalInfo.preferredRole}</Badge>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Driver License Status
                </Label>
                {isEditingAdditional ? (
                  <select
                    value={editedAdditionalInfo.driverLicenseStatus}
                    onChange={(e) => setEditedAdditionalInfo({...editedAdditionalInfo, driverLicenseStatus: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                    <option value="Not Provided">Not Provided</option>
                  </select>
                ) : (
                  <Badge variant={getLicenseStatusColor(additionalInfo.driverLicenseStatus) as any} className="mt-1">
                    {additionalInfo.driverLicenseStatus}
                  </Badge>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Vehicle Information</Label>
                {isEditingAdditional ? (
                  <Input
                    value={editedAdditionalInfo.vehicleInfo}
                    onChange={(e) => setEditedAdditionalInfo({...editedAdditionalInfo, vehicleInfo: e.target.value})}
                    className="mt-1"
                    placeholder="e.g., Toyota Camry 2020"
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{additionalInfo.vehicleInfo}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Bio</Label>
                {isEditingAdditional ? (
                  <textarea
                    value={editedAdditionalInfo.bio}
                    onChange={(e) => setEditedAdditionalInfo({...editedAdditionalInfo, bio: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Tell others about yourself..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{additionalInfo.bio}</p>
                )}
              </div>
            </div>
            
            {isEditingAdditional && (
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveAdditional} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancelAdditional} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 