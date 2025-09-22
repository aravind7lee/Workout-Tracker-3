// frontend/src/services/dashboardService.js - OFFLINE FIRST APPROACH
class DashboardService {
  constructor() {
    this.cache = new Map();
    this.mockData = this.generateMockData();
  }

  generateMockData() {
    return {
      stats: {
        totalWorkouts: 45,
        totalCalories: 12450,
        avgDuration: 42,
        streak: 7
      },
      achievements: [
        { id: 1, title: '7 Day Streak', description: 'Workout for 7 consecutive days', unlocked: true, date: new Date().toISOString() },
        { id: 2, title: 'Calorie Crusher', description: 'Burn 500+ calories in a session', unlocked: true, date: new Date().toISOString() },
        { id: 3, title: 'Consistency King', description: 'Complete 30 workouts', unlocked: false, progress: 45 }
      ],
      calories: [
        { date: '2024-01-01', calories: 450 },
        { date: '2024-01-02', calories: 520 },
        { date: '2024-01-03', calories: 380 },
        { date: '2024-01-04', calories: 610 },
        { date: '2024-01-05', calories: 490 },
        { date: '2024-01-06', calories: 550 },
        { date: '2024-01-07', calories: 420 }
      ],
      frequency: [
        { day: 'Mon', count: 8 },
        { day: 'Tue', count: 6 },
        { day: 'Wed', count: 9 },
        { day: 'Thu', count: 7 },
        { day: 'Fri', count: 10 },
        { day: 'Sat', count: 5 },
        { day: 'Sun', count: 4 }
      ],
      muscles: [
        { muscle: 'Chest', percentage: 25 },
        { muscle: 'Back', percentage: 20 },
        { muscle: 'Legs', percentage: 30 },
        { muscle: 'Arms', percentage: 15 },
        { muscle: 'Core', percentage: 10 }
      ]
    };
  }

  // Always return mock data immediately - no API calls
  async getAnalyticsStats() {
    return this.mockData.stats;
  }

  async getAchievements() {
    return this.mockData.achievements;
  }

  async getCalorieTrends() {
    return this.mockData.calories;
  }

  async getWorkoutFrequency() {
    return this.mockData.frequency;
  }

  async getMuscleDistribution() {
    return this.mockData.muscles;
  }

  async getDashboardStats() {
    return this.mockData.stats;
  }

  clearCache() {
    this.cache.clear();
  }

  // Return all mock data immediately
  async refreshAllData() {
    return {
      stats: this.mockData.stats,
      achievements: this.mockData.achievements,
      calories: this.mockData.calories,
      frequency: this.mockData.frequency,
      muscles: this.mockData.muscles,
      dashboardStats: this.mockData.stats
    };
  }

  // Simulate real-time updates with mock data
  startRealTimeUpdates(callback, interval = 30000) {
    const updateData = async () => {
      // Slightly modify mock data to simulate real-time changes
      this.mockData.stats.totalWorkouts += Math.floor(Math.random() * 2);
      this.mockData.stats.totalCalories += Math.floor(Math.random() * 50);
      
      const data = await this.refreshAllData();
      callback(data);
    };

    // Initial fetch
    updateData();

    // Set up polling with mock updates
    const intervalId = setInterval(updateData, interval);

    return () => clearInterval(intervalId);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;