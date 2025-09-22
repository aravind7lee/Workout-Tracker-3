// Real-time profile hook
import { useState, useEffect, useCallback } from 'react';
import { profileServiceReal } from '../services/profileServiceReal';

export function useRealTimeProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileData, statsData, activityData, achievementsData] = await Promise.all([
        profileServiceReal.getUserProfile(),
        profileServiceReal.getProfileStats(),
        profileServiceReal.getUserActivity(),
        profileServiceReal.getUserAchievements()
      ]);
      
      setProfile(profileData);
      setStats(statsData);
      setActivity(activityData);
      setAchievements(achievementsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await profileServiceReal.updateProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  const uploadProfilePicture = async (imageFile) => {
    try {
      const updatedProfile = await profileServiceReal.uploadProfilePicture(imageFile);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    return profileServiceReal.changePassword(passwordData);
  };

  const deleteAccount = async () => {
    return profileServiceReal.deleteAccount();
  };

  useEffect(() => {
    loadProfile();
    
    // Subscribe to real-time updates
    const unsubscribe = profileServiceReal.subscribeToUpdates((data) => {
      if (data.profile) setProfile(data.profile);
      if (data.stats) setStats(data.stats);
      if (data.activity) setActivity(data.activity);
      if (data.achievements) setAchievements(data.achievements);
    });

    return unsubscribe;
  }, [loadProfile]);

  return {
    profile,
    stats,
    activity,
    achievements,
    loading,
    error,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    deleteAccount,
    refresh: loadProfile
  };
}