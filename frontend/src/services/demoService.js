// Enhanced Demo Service - Production Ready
export class DemoService {
  constructor() {
    this.DEMO_KEY = 'gym_tracker_demo_session';
    this.DEMO_TIMEOUT = 60 * 60 * 1000; // 60 minutes
    this.startTime = null;
  }

  // Create demo session with timeout
  createDemoSession() {
    const demoUser = {
      id: 'demo_user_001',
      name: 'Demo User',
      email: 'demo@gymtracker.com',
      profileImage: null,
      isDemo: true,
      createdAt: new Date().toISOString(),
      stats: {
        totalWorkouts: 23,
        totalExercises: 67,
        streakDays: 12,
        caloriesBurned: 4250,
        xpPoints: 1850
      }
    };

    const demoToken = btoa(JSON.stringify({
      userId: demoUser.id,
      email: demoUser.email,
      isDemo: true,
      exp: Date.now() + this.DEMO_TIMEOUT
    }));

    this.startTime = Date.now();
    sessionStorage.setItem(this.DEMO_KEY, JSON.stringify({
      user: demoUser,
      token: demoToken,
      startTime: this.startTime,
      featuresExplored: []
    }));

    this.initializeDemoData();
    return { user: demoUser, token: demoToken };
  }

  // Initialize comprehensive demo data
  initializeDemoData() {
    const demoData = {
      workoutPlans: [
        {
          id: 'demo_plan_1',
          name: 'Full Body Strength',
          category: 'Strength',
          exercises: [
            { name: 'Push-ups', sets: '3x12', reps: 12, sets_count: 3, weight: 0 },
            { name: 'Squats', sets: '3x15', reps: 15, sets_count: 3, weight: 0 },
            { name: 'Plank', sets: '3x45s', duration: 45, sets_count: 3 },
            { name: 'Lunges', sets: '3x10', reps: 10, sets_count: 3, weight: 0 }
          ],
          duration: 45,
          difficulty: 'Intermediate',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo_plan_2',
          name: 'Cardio Blast',
          category: 'Cardio',
          exercises: [
            { name: 'Jumping Jacks', sets: '4x20', reps: 20, sets_count: 4 },
            { name: 'Burpees', sets: '3x8', reps: 8, sets_count: 3 },
            { name: 'Mountain Climbers', sets: '3x15', reps: 15, sets_count: 3 },
            { name: 'High Knees', sets: '3x30s', duration: 30, sets_count: 3 }
          ],
          duration: 30,
          difficulty: 'Advanced',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo_plan_3',
          name: 'Upper Body Focus',
          category: 'Strength',
          exercises: [
            { name: 'Pull-ups', sets: '3x8', reps: 8, sets_count: 3 },
            { name: 'Dips', sets: '3x10', reps: 10, sets_count: 3 },
            { name: 'Pike Push-ups', sets: '3x6', reps: 6, sets_count: 3 }
          ],
          duration: 35,
          difficulty: 'Advanced',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      workoutHistory: this.generateWorkoutHistory(),
      recentMeals: this.generateMealData(),
      achievements: this.generateAchievements(),
      progressData: this.generateProgressData(),
      analytics: this.generateAnalyticsData()
    };

    // Store in sessionStorage (auto-clears on tab close)
    sessionStorage.setItem('workoutPlans', JSON.stringify(demoData.workoutPlans));
    sessionStorage.setItem('workoutHistory', JSON.stringify(demoData.workoutHistory));
    sessionStorage.setItem('recentMeals', JSON.stringify(demoData.recentMeals));
    sessionStorage.setItem('achievements', JSON.stringify(demoData.achievements));
    sessionStorage.setItem('progressData', JSON.stringify(demoData.progressData));
    
    return demoData;
  }

  // Generate realistic workout history (3 weeks)
  generateWorkoutHistory() {
    const history = [];
    const plans = ['Full Body Strength', 'Cardio Blast', 'Upper Body Focus'];
    
    for (let i = 0; i < 21; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      if (Math.random() > 0.3) { // 70% workout completion rate
        history.push({
          id: `demo_workout_${i}`,
          planName: plans[Math.floor(Math.random() * plans.length)],
          date: date.toISOString(),
          duration: 25 + Math.floor(Math.random() * 30),
          caloriesBurned: 180 + Math.floor(Math.random() * 200),
          exercises: 3 + Math.floor(Math.random() * 3),
          completed: true,
          performance: 0.7 + Math.random() * 0.3
        });
      }
    }
    return history.reverse();
  }

  // Generate meal data
  generateMealData() {
    const meals = [
      { name: 'Grilled Chicken Salad', calories: 420, protein: 35, carbs: 15, fat: 22 },
      { name: 'Protein Smoothie', calories: 280, protein: 25, carbs: 30, fat: 8 },
      { name: 'Quinoa Bowl', calories: 380, protein: 18, carbs: 45, fat: 12 },
      { name: 'Greek Yogurt Parfait', calories: 220, protein: 20, carbs: 25, fat: 6 },
      { name: 'Salmon & Vegetables', calories: 450, protein: 40, carbs: 20, fat: 25 }
    ];

    return meals.map((meal, i) => ({
      id: `demo_meal_${i}`,
      ...meal,
      parsedName: meal.name,
      date: new Date(Date.now() - i * 4 * 60 * 60 * 1000).toISOString()
    }));
  }

  // Generate achievements
  generateAchievements() {
    return [
      {
        id: 'first_workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: '🎯',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Workout for 7 consecutive days',
        icon: '🔥',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'strength_builder',
        title: 'Strength Builder',
        description: 'Complete 10 strength workouts',
        icon: '💪',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'cardio_king',
        title: 'Cardio Champion',
        description: 'Burn 1000 calories in cardio workouts',
        icon: '❤️',
        unlocked: false,
        progress: 0.8
      }
    ];
  }

  // Generate progress data for charts
  generateProgressData() {
    const data = [];
    for (let i = 20; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        workouts: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0,
        calories: Math.floor(Math.random() * 400) + 200,
        duration: Math.floor(Math.random() * 60) + 20,
        weight: 70 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5
      });
    }
    return data;
  }

  // Generate analytics data
  generateAnalyticsData() {
    return {
      weeklyStats: {
        totalWorkouts: 5,
        totalCalories: 1420,
        avgDuration: 38,
        improvement: 15
      },
      monthlyStats: {
        totalWorkouts: 18,
        totalCalories: 4850,
        avgDuration: 42,
        improvement: 25
      },
      workoutTrends: this.generateProgressData()
    };
  }

  // Check if demo session is active and valid
  isDemoMode() {
    try {
      const demoSession = sessionStorage.getItem(this.DEMO_KEY);
      if (!demoSession) return false;

      const session = JSON.parse(demoSession);
      const now = Date.now();
      
      // Check if session expired
      if (now - session.startTime > this.DEMO_TIMEOUT) {
        this.clearDemoSession();
        return false;
      }

      return session.user?.isDemo === true;
    } catch {
      return false;
    }
  }

  // Get demo session info
  getDemoSession() {
    try {
      const demoSession = sessionStorage.getItem(this.DEMO_KEY);
      return demoSession ? JSON.parse(demoSession) : null;
    } catch {
      return null;
    }
  }

  // Track feature exploration
  trackFeatureExplored(feature) {
    try {
      const session = this.getDemoSession();
      if (session && !session.featuresExplored.includes(feature)) {
        session.featuresExplored.push(feature);
        sessionStorage.setItem(this.DEMO_KEY, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error tracking feature:', error);
    }
  }

  // Get remaining demo time
  getRemainingTime() {
    const session = this.getDemoSession();
    if (!session) return 0;
    
    const elapsed = Date.now() - session.startTime;
    return Math.max(0, this.DEMO_TIMEOUT - elapsed);
  }

  // Clear demo session
  clearDemoSession() {
    sessionStorage.removeItem(this.DEMO_KEY);
    sessionStorage.removeItem('workoutPlans');
    sessionStorage.removeItem('workoutHistory');
    sessionStorage.removeItem('recentMeals');
    sessionStorage.removeItem('achievements');
    sessionStorage.removeItem('progressData');
  }

  // Get demo dashboard data
  getDemoDashboardData() {
    const session = this.getDemoSession();
    if (!session) return null;

    return {
      stats: session.user.stats,
      recentWorkouts: JSON.parse(sessionStorage.getItem('workoutHistory') || '[]').slice(0, 3),
      upcomingPlans: JSON.parse(sessionStorage.getItem('workoutPlans') || '[]').slice(0, 2),
      totalPlans: JSON.parse(sessionStorage.getItem('workoutPlans') || '[]').length
    };
  }

  // Mock API responses for demo mode
  mockApiResponse(endpoint, data = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: data,
          message: 'Demo data loaded successfully'
        });
      }, 300 + Math.random() * 200); // Realistic API delay
    });
  }
}

export const demoService = new DemoService();
export default demoService;