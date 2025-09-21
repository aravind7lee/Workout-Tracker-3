import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  HelpCircle,
  Save,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    fitnessGoal: 'maintain',
    activityLevel: 'moderate',
    emailNotifications: true,
    pushNotifications: true,
    workoutReminders: true,
    theme: 'dark',
    language: 'en',
    units: 'metric'
  });

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'fitness', label: 'Fitness Goals', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'preferences', label: 'App Preferences', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (settings.name !== user?.name || settings.email !== user?.email) {
        updateUser({
          ...user,
          name: settings.name,
          email: settings.email
        });
      }
      
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => handleSettingChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => handleSettingChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => handleSettingChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
          <input
            type="text"
            value={settings.location}
            onChange={(e) => handleSettingChange('location', e.target.value)}
            placeholder="City, Country"
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>
    </div>
  );

  const renderFitnessSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Fitness Goal</label>
          <select
            value={settings.fitnessGoal}
            onChange={(e) => handleSettingChange('fitnessGoal', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="lose">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain">Gain Weight</option>
            <option value="muscle">Build Muscle</option>
            <option value="strength">Increase Strength</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Activity Level</label>
          <select
            value={settings.activityLevel}
            onChange={(e) => handleSettingChange('activityLevel', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly Active</option>
            <option value="moderate">Moderately Active</option>
            <option value="very">Very Active</option>
            <option value="extra">Extra Active</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get notifications on your device' },
        { key: 'workoutReminders', label: 'Workout Reminders', desc: 'Remind me to workout' }
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
          <div>
            <div className="text-white font-medium">{item.label}</div>
            <div className="text-slate-400 text-sm">{item.desc}</div>
          </div>
          <button
            onClick={() => handleSettingChange(item.key, !settings[item.key])}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings[item.key] ? 'bg-blue-600' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings[item.key] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'fitness': return renderFitnessSettings();
      case 'notifications': return renderNotificationSettings();
      case 'preferences': return renderPreferencesSettings();
      default: return (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">Coming Soon</div>
          <div className="text-slate-500 text-sm">This section is under development</div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl lg:text-3xl font-semibold text-white">Settings</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSaving ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="font-semibold text-white">Settings</h3>
            </div>
            <div className="space-y-1 p-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                {settingsTabs.find(tab => tab.id === activeTab)?.label}
              </h3>
              <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500 w-16"></div>
            </div>
            
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}