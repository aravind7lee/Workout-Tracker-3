import Workout from '../models/Workout.js';
import Plan from '../models/Plan.js';
import mongoose from 'mongoose';

export class FitnessIntelligenceService {
  /**
   * 1. Progressive Overload Algorithm
   * Rule: If an exercise has been logged in >= 2 recent sessions, and in the last 2 sessions
   * every set met or exceeded target reps (>= 6 reps) with completed status,
   * recommend a +2.5kg (upper body) or +5.0kg (legs) load increase.
   */
  static async getProgressiveOverload(userId) {
    const userObjId = new mongoose.Types.ObjectId(userId.toString());
    
    // Fetch last 20 completed workouts sorted by date descending
    const workouts = await Workout.find({ user: userObjId, completed: true })
      .sort({ date: -1 })
      .limit(20);

    if (workouts.length < 2) return [];

    // Group sets by exerciseName across workouts
    const exerciseHistory = {};
    workouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        const name = ex.exerciseName || ex.name;
        if (!name) return;
        if (!exerciseHistory[name]) exerciseHistory[name] = [];
        exerciseHistory[name].push({
          workoutId: w._id,
          date: w.date || w.createdAt,
          sets: ex.sets || []
        });
      });
    });

    const recommendations = [];

    for (const [exName, sessions] of Object.entries(exerciseHistory)) {
      if (sessions.length < 2) continue;

      // Inspect latest 2 sessions for this exercise
      const latestTwo = sessions.slice(0, 2);
      let qualifiesForIncrease = true;
      let currentMaxWeight = 0;

      latestTwo.forEach(sess => {
        if (!sess.sets || sess.sets.length === 0) {
          qualifiesForIncrease = false;
          return;
        }

        sess.sets.forEach(s => {
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          if (w > currentMaxWeight) currentMaxWeight = w;
          if (r < 6) qualifiesForIncrease = false;
        });
      });

      if (qualifiesForIncrease && currentMaxWeight > 0) {
        const isLowerBody = /squat|deadlift|leg|lunge|calf/i.test(exName);
        const increment = isLowerBody ? 5.0 : 2.5;
        const suggestedWeight = currentMaxWeight + increment;

        recommendations.push({
          id: `po_${exName.replace(/\s+/g, '_')}`,
          type: 'progressive_overload',
          exerciseName: exName,
          title: `Increase load for ${exName}`,
          recommendation: `Consider increasing working weight from ${currentMaxWeight}kg to ${suggestedWeight}kg on your next session.`,
          reason: `You successfully completed all sets at ${currentMaxWeight}kg across your last 2 consecutive sessions.`,
          supportingData: {
            currentWeight: currentMaxWeight,
            suggestedWeight,
            increment,
            consecutiveSessions: 2
          },
          confidence: 'high',
          timestamp: new Date()
        });
      }
    }

    return recommendations;
  }

  /**
   * 2. Plateau Detection Algorithm
   * Rule: If an exercise has >= 4 sessions in history, and max weight lifted across the last 4
   * sessions has remained within +/- 2.5% (or identical), signal a potential plateau.
   */
  static async getPlateauDetections(userId) {
    const userObjId = new mongoose.Types.ObjectId(userId.toString());
    const workouts = await Workout.find({ user: userObjId, completed: true })
      .sort({ date: -1 })
      .limit(30);

    const exerciseHistory = {};
    workouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        const name = ex.exerciseName || ex.name;
        if (!name) return;
        if (!exerciseHistory[name]) exerciseHistory[name] = [];
        const maxW = Math.max(...(ex.sets || []).map(s => Number(s.weight) || 0), 0);
        if (maxW > 0) {
          exerciseHistory[name].push({
            date: w.date || w.createdAt,
            maxWeight: maxW
          });
        }
      });
    });

    const plateaus = [];

    for (const [exName, logs] of Object.entries(exerciseHistory)) {
      if (logs.length < 4) continue;
      const recentFour = logs.slice(0, 4);
      const weights = recentFour.map(l => l.maxWeight);

      const minW = Math.min(...weights);
      const maxW = Math.max(...weights);
      const variancePercent = minW > 0 ? ((maxW - minW) / minW) * 100 : 0;

      if (variancePercent <= 2.5 && maxW > 0) {
        plateaus.push({
          id: `plat_${exName.replace(/\s+/g, '_')}`,
          type: 'plateau_detected',
          exerciseName: exName,
          title: `Potential plateau detected on ${exName}`,
          recommendation: `Your working weight for ${exName} has remained around ${maxW}kg for ${weights.length} consecutive sessions.`,
          reason: `Weight variation is less than 2.5% across your last ${weights.length} sessions.`,
          suggestedActions: [
            'Try altering set/rep ranges (e.g. 5x5 heavy strength vs 3x12 hypertrophy)',
            'Adjust rest intervals or exercise sequence in your routine',
            'Ensure adequate recovery and nutritional caloric support'
          ],
          supportingData: {
            sessionsCount: weights.length,
            averageWeight: maxW,
            weights
          },
          confidence: 'medium',
          timestamp: new Date()
        });
      }
    }

    return plateaus;
  }

  /**
   * 3. Muscle Volume Balance Algorithm
   * Rule: Group set counts across muscle categories over past 30 days. Identify Push/Pull or Upper/Lower imbalances.
   */
  static async getMuscleBalance(userId) {
    const userObjId = new mongoose.Types.ObjectId(userId.toString());
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts = await Workout.find({
      user: userObjId,
      completed: true,
      date: { $gte: thirtyDaysAgo }
    });

    const MUSCLE_MAPPING = {
      'bench press': 'Chest', 'chest': 'Chest', 'pushup': 'Chest', 'push-up': 'Chest', 'dip': 'Chest',
      'pullup': 'Back', 'pull-up': 'Back', 'row': 'Back', 'lat': 'Back', 'deadlift': 'Back',
      'squat': 'Legs', 'leg': 'Legs', 'lunge': 'Legs', 'calf': 'Legs',
      'shoulder': 'Shoulders', 'overhead': 'Shoulders', 'lateral': 'Shoulders',
      'curl': 'Arms', 'tricep': 'Arms',
      'plank': 'Abs/Core', 'crunch': 'Abs/Core'
    };

    const muscleSets = { Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, 'Abs/Core': 0, Other: 0 };
    let totalSets = 0;

    workouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        const name = (ex.exerciseName || ex.name || '').toLowerCase();
        let cat = 'Other';
        for (const [key, category] of Object.entries(MUSCLE_MAPPING)) {
          if (name.includes(key)) {
            cat = category;
            break;
          }
        }
        const setsCount = (ex.sets || []).length || 1;
        muscleSets[cat] = (muscleSets[cat] || 0) + setsCount;
        totalSets += setsCount;
      });
    });

    const pushSets = (muscleSets.Chest || 0) + (muscleSets.Shoulders || 0);
    const pullSets = (muscleSets.Back || 0);
    const legSets = (muscleSets.Legs || 0);

    const observations = [];

    if (totalSets >= 10) {
      const legPercent = Math.round((legSets / totalSets) * 100);
      if (legPercent < 15) {
        observations.push({
          id: 'mb_lower_body_bias',
          type: 'muscle_balance',
          title: 'Lower Body Training Volume Observation',
          recommendation: `Your lower body (Legs) accounts for ${legPercent}% of your total logged sets over the past 30 days.`,
          reason: 'Balanced structural development benefits from proportional upper and lower body volume.',
          supportingData: { legSets, totalSets, legPercent },
          confidence: 'high',
          timestamp: new Date()
        });
      }

      if (pullSets > 0 && pushSets / pullSets >= 2.0) {
        observations.push({
          id: 'mb_push_pull_imbalance',
          type: 'muscle_balance',
          title: 'Push vs. Pull Volume Ratio',
          recommendation: `Your Push-to-Pull volume ratio is currently ${(pushSets / pullSets).toFixed(1)}:1 (${pushSets} Push sets vs ${pullSets} Pull sets).`,
          reason: 'Incorporating equal back/pulling volume supports shoulder joint balance and posture.',
          supportingData: { pushSets, pullSets, ratio: (pushSets / pullSets).toFixed(1) },
          confidence: 'medium',
          timestamp: new Date()
        });
      }
    }

    return {
      muscleSets,
      totalSets,
      observations
    };
  }

  /**
   * 4. Recovery & Training Load Deload Signal Algorithm
   * Rule: Checks weekly total volume over 4 consecutive weeks.
   * If volume has increased continuously every single week for 4+ weeks, generate a conservative recovery signal.
   */
  static async getRecoverySignal(userId) {
    const userObjId = new mongoose.Types.ObjectId(userId.toString());
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const workouts = await Workout.find({
      user: userObjId,
      completed: true,
      date: { $gte: fourWeeksAgo }
    }).sort({ date: 1 });

    if (workouts.length < 6) return null;

    const weeklyVolumes = [0, 0, 0, 0];
    const nowMs = Date.now();

    workouts.forEach(w => {
      const wDate = new Date(w.date || w.createdAt).getTime();
      const weeksAgo = Math.floor((nowMs - wDate) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 4) {
        weeklyVolumes[3 - weeksAgo] += (w.totalVolume || 0);
      }
    });

    const isIncreasingConcurrently = 
      weeklyVolumes[0] > 0 &&
      weeklyVolumes[1] > weeklyVolumes[0] &&
      weeklyVolumes[2] > weeklyVolumes[1] &&
      weeklyVolumes[3] > weeklyVolumes[2];

    if (isIncreasingConcurrently) {
      return {
        id: 'rec_signal_deload',
        type: 'recovery_signal',
        title: 'Consecutive Training Load Increase',
        recommendation: 'Your total weekly training volume has increased continuously for 4 consecutive weeks.',
        reason: 'Periodic recovery weeks or lighter loads help maintain long-term progression and manage fatigue.',
        supportingData: { weeklyVolumes },
        confidence: 'medium',
        timestamp: new Date()
      };
    }

    return null;
  }

  /**
   * 5. "What Should I Do Today?" Engine
   * Rule: Checks active workout plans and recent completed workouts to recommend today's target session.
   */
  static async getTodayFocus(userId) {
    const userObjId = new mongoose.Types.ObjectId(userId.toString());

    const plans = await Plan.find({ user: userObjId }).sort({ createdAt: -1 });
    const lastWorkout = await Workout.findOne({ user: userObjId, completed: true }).sort({ date: -1 });

    if (plans.length > 0) {
      const plan = plans[0];
      return {
        hasPlan: true,
        planId: plan._id,
        planName: plan.name,
        recommendation: `Today's suggested session: ${plan.name}`,
        reason: `Based on your active plan "${plan.name}" with ${plan.exercises?.length || 0} prescribed exercises.`,
        lastWorkoutDate: lastWorkout ? lastWorkout.date || lastWorkout.createdAt : null,
        exercises: plan.exercises || []
      };
    }

    if (lastWorkout) {
      return {
        hasPlan: false,
        lastWorkoutTitle: lastWorkout.title,
        lastWorkoutDate: lastWorkout.date || lastWorkout.createdAt,
        recommendation: `Repeat or build on your last session "${lastWorkout.title}"`,
        reason: `Your last session was logged on ${new Date(lastWorkout.date || lastWorkout.createdAt).toLocaleDateString()}.`
      };
    }

    return {
      hasPlan: false,
      recommendation: 'Start a Freestyle Session or create a Workout Plan',
      reason: 'No active plan or historical sessions found.'
    };
  }

  /**
   * Master Recommendation Package Evaluator
   */
  static async getAllRecommendations(userId) {
    const [overload, plateaus, balance, recovery, todayFocus] = await Promise.all([
      this.getProgressiveOverload(userId),
      this.getPlateauDetections(userId),
      this.getMuscleBalance(userId),
      this.getRecoverySignal(userId),
      this.getTodayFocus(userId)
    ]);

    const allItems = [
      ...overload,
      ...plateaus,
      ...(balance.observations || []),
      ...(recovery ? [recovery] : [])
    ];

    return {
      success: true,
      recommendations: allItems,
      todayFocus,
      muscleBalance: balance,
      generatedAt: new Date()
    };
  }
}

export default FitnessIntelligenceService;
