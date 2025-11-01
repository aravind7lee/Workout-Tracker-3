import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { migrateToUserSpecificMeals } from '../utils/userSpecificMeals';
import { clearAllOldMealData, initializeEmptyUserMeals } from '../utils/clearOldMealData';
import '../styles/meal-calendar.css';

const MealTrackingCalendar = () => {
  const { user } = useAuth();
  const [mealData, setMealData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalMealsToday, setTotalMealsToday] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [averageMealsPerDay, setAverageMealsPerDay] = useState(0);

  // Load meal data from localStorage and calculate statistics
  const loadMealData = () => {
    try {
      // Get current user for user-specific meal data
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (!currentUser) {
        setMealData({});
        setTotalMealsToday(0);
        setWeeklyTotal(0);
        setMonthlyTotal(0);
        setAverageMealsPerDay(0);
        return;
      }
      
      // Use user-specific localStorage key
      const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
      const meals = JSON.parse(localStorage.getItem(userMealKey) || '[]');
      const mealsByDate = {};
      
      // Group meals by date
      meals.forEach(meal => {
        const mealDate = new Date(meal.consumedAt || meal.createdAt || Date.now());
        const dateKey = mealDate.toDateString();
        
        if (!mealsByDate[dateKey]) {
          mealsByDate[dateKey] = [];
        }
        mealsByDate[dateKey].push(meal);
      });

      setMealData(mealsByDate);

      // Calculate statistics
      const today = new Date().toDateString();
      const todayMeals = mealsByDate[today] || [];
      setTotalMealsToday(todayMeals.length);

      // Calculate weekly total (last 7 days)
      let weeklyCount = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();
        weeklyCount += (mealsByDate[dateKey] || []).length;
      }
      setWeeklyTotal(weeklyCount);

      // Calculate monthly total (current month)
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      let monthlyCount = 0;
      
      Object.keys(mealsByDate).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          monthlyCount += mealsByDate[dateKey].length;
        }
      });
      setMonthlyTotal(monthlyCount);

      // Calculate average meals per day (last 30 days)
      let totalMealsLast30Days = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();
        totalMealsLast30Days += (mealsByDate[dateKey] || []).length;
      }
      setAverageMealsPerDay((totalMealsLast30Days / 30).toFixed(1));

    } catch (error) {
      console.error('Error loading meal data:', error);
    }
  };

  useEffect(() => {
    // Only clear old data if no user-specific meals exist
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser) {
      const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
      const existingUserMeals = localStorage.getItem(userMealKey);
      if (!existingUserMeals) {
        clearAllOldMealData();
        initializeEmptyUserMeals(currentUser.id || currentUser._id);
      }
    }
    
    loadMealData();
    
    // Listen for meal updates
    const handleMealAdded = () => loadMealData();
    const handleMealDeleted = () => loadMealData();
    
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('mealDeleted', handleMealDeleted);
    
    return () => {
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('mealDeleted', handleMealDeleted);
    };
  }, [currentDate]);

  // Generate calendar days for monthly view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateKey = currentDateObj.toDateString();
      const mealsForDay = mealData[dateKey] || [];
      const isCurrentMonth = currentDateObj.getMonth() === month;
      const isToday = dateKey === new Date().toDateString();
      
      days.push({
        date: new Date(currentDateObj),
        dateKey,
        mealsCount: mealsForDay.length,
        meals: mealsForDay,
        isCurrentMonth,
        isToday
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  // Generate weekly view data
  const generateWeeklyData = () => {
    const weekData = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toDateString();
      const mealsForDay = mealData[dateKey] || [];
      
      weekData.push({
        date,
        dateKey,
        mealsCount: mealsForDay.length,
        meals: mealsForDay,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        isToday: dateKey === new Date().toDateString()
      });
    }
    
    return weekData;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getMealCountColor = (count) => {
    if (count === 0) return 'bg-slate-700/50 text-slate-500';
    if (count <= 2) return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    if (count <= 4) return 'bg-green-500/20 text-green-400 border border-green-500/30';
    return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  };

  const renderMonthlyView = () => {
    const days = generateCalendarDays();
    
    return (
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="meal-calendar-nav">
          <button
            onClick={() => navigateMonth(-1)}
            className="meal-nav-button hover:bg-slate-600/50 transition-colors"
          >
            ←
          </button>
          <h3 className="meal-nav-title text-white">
            {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="meal-nav-button hover:bg-slate-600/50 transition-colors"
          >
            →
          </button>
        </div>

        {/* Days of week header */}
        <div className="meal-calendar-grid mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="meal-calendar-day-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="meal-calendar-grid">
          {days.map((day, index) => (
            <motion.div
              key={index}
              className={`meal-calendar-day ${
                day.isCurrentMonth ? 'bg-slate-800/50' : 'bg-slate-900/30'
              } ${day.isToday ? 'ring-1 ring-orange-500/50 today' : ''} ${
                day.mealsCount > 0 ? 'has-meals' : 'no-meals'
              }`}
              onClick={() => setSelectedDate(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`meal-day-number ${
                day.isCurrentMonth ? 'text-white' : 'text-slate-500'
              } ${day.isToday ? 'text-orange-400' : ''}`}>
                {day.date.getDate()}
              </div>
              
              {day.mealsCount > 0 && (
                <div className={`meal-count-badge ${getMealCountColor(day.mealsCount)}`}>
                  {day.mealsCount}
                </div>
              )}
              
              {day.isToday && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekData = generateWeeklyData();
    
    return (
      <div className="space-y-4">
        {/* Week Navigation */}
        <div className="meal-calendar-nav">
          <button
            onClick={() => navigateWeek(-1)}
            className="meal-nav-button hover:bg-slate-600/50 transition-colors"
          >
            <span className="hidden sm:inline">← Previous Week</span>
            <span className="sm:hidden">← Prev</span>
          </button>
          <h3 className="meal-nav-title text-white">
            <span className="hidden sm:inline">Week of {weekData[0]?.date.toLocaleDateString()}</span>
            <span className="sm:hidden">{weekData[0]?.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
          </h3>
          <button
            onClick={() => navigateWeek(1)}
            className="meal-nav-button hover:bg-slate-600/50 transition-colors"
          >
            <span className="hidden sm:inline">Next Week →</span>
            <span className="sm:hidden">Next →</span>
          </button>
        </div>

        {/* Weekly Grid */}
        <div className="meal-weekly-grid">
          {weekData.map((day, index) => (
            <motion.div
              key={index}
              className={`meal-weekly-day ${
                day.isToday ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30' : 'bg-slate-800/50'
              } hover:bg-slate-700/50 hover:scale-105`}
              onClick={() => setSelectedDate(day)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <div className={`text-sm font-semibold mb-2 ${day.isToday ? 'text-orange-400' : 'text-slate-400'}`}>
                  {day.dayName}
                </div>
                <div className={`text-lg font-bold mb-2 ${day.isToday ? 'text-white' : 'text-slate-300'}`}>
                  {day.date.getDate()}
                </div>
                <div className={`
                  text-2xl font-black mb-2
                  ${day.mealsCount > 0 ? 'text-green-400' : 'text-slate-500'}
                `}>
                  {day.mealsCount}
                </div>
                <div className="text-xs text-slate-400">
                  meal{day.mealsCount !== 1 ? 's' : ''}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderDailyView = () => {
    const dateKey = currentDate.toDateString();
    const todayMeals = mealData[dateKey] || [];
    
    return (
      <div className="space-y-4">
        {/* Daily Navigation */}
        <div className="meal-calendar-nav">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() - 1);
              setCurrentDate(newDate);
            }}
            className="meal-nav-button hover:bg-slate-600/50 transition-colors"
          >
            <span className="hidden sm:inline">← Previous Day</span>
            <span className="sm:hidden">← Prev</span>
          </button>
          <h3 className="meal-nav-title text-white">
            <span className="hidden sm:inline">
              {currentDate.toLocaleDateString('en', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="sm:hidden">
              {currentDate.toLocaleDateString('en', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </h3>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() + 1);
              setCurrentDate(newDate);
            }}
            className="meal-nav-button hover:bg-slate-600/50 transition-colors"
          >
            <span className="hidden sm:inline">Next Day →</span>
            <span className="sm:hidden">Next →</span>
          </button>
        </div>

        {/* Daily Stats */}
        <div className="meal-daily-view mb-6">
          <div className="meal-daily-count text-green-400">
            {todayMeals.length}
          </div>
          <div className="text-sm sm:text-lg text-slate-300">
            Meals Logged Today
          </div>
        </div>

        {/* Meal List */}
        {todayMeals.length > 0 ? (
          <div className="meal-list">
            {todayMeals.map((meal, index) => (
              <div key={index} className="meal-item">
                <div className="meal-item-header">
                  <div className="flex-1">
                    <h4 className="meal-item-name text-white">{meal.name || meal.parsedName}</h4>
                    <div className="meal-item-details">
                      {Math.round(meal.calories || 0)} cal • {meal.mealType || 'snack'}
                    </div>
                  </div>
                  <div className="meal-item-time">
                    {new Date(meal.consumedAt || meal.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-3xl sm:text-4xl mb-4">🍽️</div>
            <div className="text-slate-400 text-sm sm:text-base">No meals logged for this day</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="meal-calendar-container space-y-4">
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-xl sm:rounded-2xl border border-orange-500/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-2">
              🍽️ MEAL TRACKING CALENDAR
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Track your daily nutrition consistency with real-time meal logging data
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-green-400 bg-green-500/20 px-3 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">REAL-TIME DATA</span>
            <span className="sm:hidden">LIVE</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="meal-stats-grid mb-4 sm:mb-6">
          <div className="text-center p-3 bg-slate-800/30 rounded-lg">
            <div className="text-xl sm:text-2xl font-black text-orange-400 mb-1">{totalMealsToday}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Today</div>
          </div>
          <div className="text-center p-3 bg-slate-800/30 rounded-lg">
            <div className="text-xl sm:text-2xl font-black text-green-400 mb-1">{weeklyTotal}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">This Week</div>
          </div>
          <div className="text-center p-3 bg-slate-800/30 rounded-lg">
            <div className="text-xl sm:text-2xl font-black text-blue-400 mb-1">{monthlyTotal}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">This Month</div>
          </div>
          <div className="text-center p-3 bg-slate-800/30 rounded-lg">
            <div className="text-xl sm:text-2xl font-black text-purple-400 mb-1">{averageMealsPerDay}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Daily Avg</div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="meal-view-selector">
          {['daily', 'weekly', 'monthly'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`meal-view-button ${
                viewMode === mode 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Views */}
      <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'monthly' && renderMonthlyView()}
            {viewMode === 'weekly' && renderWeeklyView()}
            {viewMode === 'daily' && renderDailyView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selected Date Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              className="bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full max-h-[85vh] overflow-y-auto meal-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="meal-modal-header">
                <h3 className="meal-modal-title text-white">
                  <span className="hidden sm:inline">
                    {selectedDate.date.toLocaleDateString('en', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="sm:hidden">
                    {selectedDate.date.toLocaleDateString('en', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="meal-modal-close"
                >
                  ✕
                </button>
              </div>

              <div className="meal-modal-stats">
                <div className="meal-modal-count text-green-400">
                  {selectedDate.mealsCount}
                </div>
                <div className="meal-modal-label text-slate-300">
                  Meal{selectedDate.mealsCount !== 1 ? 's' : ''} Logged
                </div>
              </div>

              {selectedDate.meals.length > 0 ? (
                <div className="meal-list">
                  {selectedDate.meals.map((meal, index) => (
                    <div key={index} className="meal-item">
                      <div className="meal-item-header">
                        <div className="flex-1">
                          <div className="meal-item-name text-white">
                            {meal.name || meal.parsedName}
                          </div>
                          <div className="meal-item-details">
                            {Math.round(meal.calories || 0)} cal • {meal.mealType || 'snack'}
                          </div>
                        </div>
                        <div className="meal-item-time">
                          {new Date(meal.consumedAt || meal.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="meal-modal-empty">
                  <div className="meal-modal-empty-icon">🍽️</div>
                  <div className="meal-modal-empty-text">No meals logged</div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealTrackingCalendar;