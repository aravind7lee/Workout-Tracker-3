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

  // Generate calendar days for monthly view (only current month)
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    for (let day = 1; day <= lastDay; day++) {
      const currentDateObj = new Date(year, month, day);
      const dateKey = currentDateObj.toDateString();
      const mealsForDay = mealData[dateKey] || [];
      const isToday = dateKey === new Date().toDateString();
      
      days.push({
        date: new Date(currentDateObj),
        dateKey,
        mealsCount: mealsForDay.length,
        meals: mealsForDay,
        isCurrentMonth: true,
        isToday
      });
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
      <div className="space-y-3 sm:space-y-4">
        {/* Mobile-Optimized Calendar Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm font-bold transition-colors"
          >
            ←
          </button>
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white text-center flex-1">
            <span className="hidden sm:inline">
              {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </span>
            <span className="sm:hidden">
              {currentDate.toLocaleDateString('en', { month: 'short', year: 'numeric' })}
            </span>
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm font-bold transition-colors"
          >
            →
          </button>
        </div>

        {/* Mobile-Optimized Days Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-bold text-slate-400 py-1">
              <span className="sm:hidden">{day}</span>
              <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</span>
            </div>
          ))}
        </div>

        {/* Mobile-Optimized Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => (
            <motion.div
              key={index}
              className={`
                relative aspect-square min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem]
                flex flex-col items-center justify-center
                rounded-lg cursor-pointer transition-all duration-200
                border border-transparent
                ${
                  day.isToday 
                    ? 'bg-orange-500/20 border-orange-500/50 ring-1 ring-orange-500/30' 
                    : day.mealsCount > 0 
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                      : 'bg-slate-800/30 hover:bg-slate-700/50'
                }
              `}
              onClick={() => setSelectedDate(day)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`text-xs sm:text-sm font-bold mb-1 ${
                day.isToday ? 'text-orange-400' : 'text-white'
              }`}>
                {day.date.getDate()}
              </div>
              
              {day.mealsCount > 0 && (
                <div className={`
                  text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${getMealCountColor(day.mealsCount)}
                `}>
                  {day.mealsCount}
                </div>
              )}
              
              {day.isToday && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
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
      <div className="space-y-3 sm:space-y-4">
        {/* Mobile-Optimized Week Navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="hidden sm:inline">← Prev Week</span>
            <span className="sm:hidden">←</span>
          </button>
          <h3 className="text-sm sm:text-base font-bold text-white text-center flex-1">
            <span className="hidden sm:inline">Week of {weekData[0]?.date.toLocaleDateString()}</span>
            <span className="sm:hidden">{weekData[0]?.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
          </h3>
          <button
            onClick={() => navigateWeek(1)}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="hidden sm:inline">Next Week →</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>

        {/* Mobile-Optimized Weekly Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-3">
          {weekData.map((day, index) => (
            <motion.div
              key={index}
              className={`
                p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200
                ${
                  day.isToday 
                    ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30' 
                    : 'bg-slate-800/50 hover:bg-slate-700/50'
                }
              `}
              onClick={() => setSelectedDate(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                <div className="flex-shrink-0">
                  <div className={`text-sm font-bold ${day.isToday ? 'text-orange-400' : 'text-slate-400'}`}>
                    {day.dayName}
                  </div>
                  <div className={`text-lg font-bold ${day.isToday ? 'text-white' : 'text-slate-300'}`}>
                    {day.date.getDate()}
                  </div>
                </div>
                <div className="flex-1 sm:flex-none text-center">
                  <div className={`
                    text-xl sm:text-2xl font-black mb-1
                    ${day.mealsCount > 0 ? 'text-green-400' : 'text-slate-500'}
                  `}>
                    {day.mealsCount}
                  </div>
                  <div className="text-xs text-slate-400">
                    meal{day.mealsCount !== 1 ? 's' : ''}
                  </div>
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
      <div className="space-y-3 sm:space-y-4">
        {/* Mobile-Optimized Daily Navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() - 1);
              setCurrentDate(newDate);
            }}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="hidden sm:inline">← Prev Day</span>
            <span className="sm:hidden">←</span>
          </button>
          <h3 className="text-sm sm:text-base font-bold text-white text-center flex-1">
            <span className="hidden sm:inline">
              {currentDate.toLocaleDateString('en', { 
                weekday: 'long', 
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
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="hidden sm:inline">Next Day →</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>

        {/* Mobile-Optimized Daily Stats */}
        <div className="text-center py-4 sm:py-6 bg-slate-800/30 rounded-lg">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-400 mb-2">
            {todayMeals.length}
          </div>
          <div className="text-sm sm:text-base text-slate-300">
            Meals Logged
          </div>
        </div>

        {/* Mobile-Optimized Meal List */}
        {todayMeals.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {todayMeals.map((meal, index) => (
              <div key={index} className="bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-700/50">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm sm:text-base truncate">
                      {meal.name || meal.parsedName}
                    </h4>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1">
                      {Math.round(meal.calories || 0)} cal • {meal.mealType || 'snack'}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-right flex-shrink-0">
                    {new Date(meal.consumedAt || meal.createdAt).toLocaleTimeString('en', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-4xl sm:text-5xl mb-3">🍽️</div>
            <div className="text-slate-400 text-sm sm:text-base">No meals logged for this day</div>
            <div className="text-xs text-slate-500 mt-2">Start tracking your nutrition!</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="meal-calendar-container space-y-3 sm:space-y-4">
      {/* Mobile-Optimized Header with Stats */}
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-lg sm:rounded-xl border border-orange-500/20 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="text-center sm:text-left">
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-wider mb-1">
              🍽️ MEAL CALENDAR
            </h2>
            <p className="text-slate-400 text-xs hidden sm:block">
              Track your daily nutrition consistency
            </p>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="font-bold">LIVE</span>
          </div>
        </div>

        {/* Mobile-Optimized Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="text-center p-2 sm:p-3 bg-slate-800/30 rounded-lg">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-orange-400 mb-1">{totalMealsToday}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Today</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-slate-800/30 rounded-lg">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-green-400 mb-1">{weeklyTotal}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Week</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-slate-800/30 rounded-lg">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-blue-400 mb-1">{monthlyTotal}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Month</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-slate-800/30 rounded-lg">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-purple-400 mb-1">{averageMealsPerDay}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Avg</div>
          </div>
        </div>

        {/* Mobile-Optimized View Mode Selector */}
        <div className="flex justify-center gap-1 sm:gap-2">
          {['daily', 'weekly', 'monthly'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide transition-all ${
                viewMode === mode 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile-Optimized Calendar Views */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 lg:p-6">
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

      {/* Mobile-Optimized Selected Date Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              className="bg-slate-800 rounded-lg sm:rounded-xl border border-slate-700/50 p-4 sm:p-6 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white">
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
                  className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Mobile Modal Stats */}
              <div className="text-center py-4 bg-slate-900/50 rounded-lg mb-4">
                <div className="text-2xl sm:text-3xl font-black text-green-400 mb-1">
                  {selectedDate.mealsCount}
                </div>
                <div className="text-sm text-slate-300">
                  Meal{selectedDate.mealsCount !== 1 ? 's' : ''} Logged
                </div>
              </div>

              {/* Mobile Meal List */}
              {selectedDate.meals.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {selectedDate.meals.map((meal, index) => (
                    <div key={index} className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm sm:text-base truncate">
                            {meal.name || meal.parsedName}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 mt-1">
                            {Math.round(meal.calories || 0)} cal • {meal.mealType || 'snack'}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 text-right flex-shrink-0">
                          {new Date(meal.consumedAt || meal.createdAt).toLocaleTimeString('en', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-3xl sm:text-4xl mb-3">🍽️</div>
                  <div className="text-slate-400 text-sm sm:text-base">No meals logged</div>
                  <div className="text-xs text-slate-500 mt-1">Start tracking your nutrition!</div>
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