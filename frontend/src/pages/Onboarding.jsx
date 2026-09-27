import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Brain,
  Check,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  Flame,
  Loader2,
  Pencil,
  RefreshCw,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSplitRecommendation, resetOnboarding, submitOnboarding } from '../services/onboardingService';
import heroImg from '../assets/Heroimg.jpg';

const TOTAL_STEPS = 8;

const goals = [
  { value: 'deficit', label: 'Lose Weight', detail: 'A sustainable calorie deficit', icon: Flame },
  { value: 'bulk', label: 'Build Muscle', detail: 'Hypertrophy and lean mass', icon: Dumbbell },
  { value: 'maintenance', label: 'Maintain', detail: 'Keep strength and body weight', icon: ShieldCheck },
  { value: 'strength', label: 'Get Stronger', detail: 'Heavy compounds and longer rest', icon: Target },
  { value: 'recomposition', label: 'Body Recomposition', detail: 'Build muscle while leaning out', icon: RefreshCw }
];

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', detail: 'Mostly seated outside training' },
  { value: 'light', label: 'Lightly Active', detail: 'Light movement 1?3 days/week' },
  { value: 'moderate', label: 'Moderately Active', detail: 'Active lifestyle 3?5 days/week' },
  { value: 'very', label: 'Very Active', detail: 'Hard activity 6?7 days/week' },
  { value: 'extra', label: 'Extra Active', detail: 'Physical job plus hard training' }
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', detail: 'Under 1 year' },
  { value: 'intermediate', label: 'Intermediate', detail: '1?3 years' },
  { value: 'advanced', label: 'Advanced', detail: '3+ years' }
];

const AVAILABLE_SPLITS = [
  {
    id: 'ppl-6',
    name: 'Push / Pull / Legs (6-Day)',
    frequency: 6,
    difficulty: 'Intermediate - Advanced',
    category: 'Hypertrophy & Strength',
    description: 'The gold standard 6-day split alternating push, pull, and leg days for maximum muscle growth and progressive overload.',
    days: ['Push (Chest, Delts, Triceps)', 'Pull (Back, Traps, Biceps)', 'Legs (Quads, Hams, Calves)', 'Push (Chest, Delts, Triceps)', 'Pull (Back, Traps, Biceps)', 'Legs (Quads, Hams, Calves)']
  },
  {
    id: 'upper-lower-4',
    name: 'Upper / Lower Split (4-Day)',
    frequency: 4,
    difficulty: 'All Levels',
    category: 'Balanced Hypertrophy',
    description: 'Perfect balance of high frequency and optimal recovery, hitting upper and lower body twice a week with compound focus.',
    days: ['Upper Body A (Chest/Back/Arms)', 'Lower Body A (Quads/Hamstrings)', 'Upper Body B (Shoulders/Back/Arms)', 'Lower Body B (Glutes/Calves/Core)']
  },
  {
    id: 'upper-lower-full-5',
    name: 'Upper / Lower + Full Body (5-Day)',
    frequency: 5,
    difficulty: 'Intermediate',
    category: 'Athletic Conditioning',
    description: 'High frequency split combining heavy upper/lower foundations with an explosive full-body & core session on day five.',
    days: ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body', 'Full Body & Core']
  },
  {
    id: 'arnold-6',
    name: 'Arnold Schwarzenegger Split (6-Day)',
    frequency: 6,
    difficulty: 'Advanced',
    category: 'Classic Bodybuilding',
    description: 'Antagonist muscle pairing for chest & back, shoulders & arms, and legs for maximum blood flow, pump, and symmetry.',
    days: ['Chest & Back', 'Shoulders & Arms', 'Legs & Calves', 'Chest & Back', 'Shoulders & Arms', 'Legs & Calves']
  },
  {
    id: 'bro-split-5',
    name: 'Body Part Split / Bro Split (5-Day)',
    frequency: 5,
    difficulty: 'Intermediate - Advanced',
    category: 'Maximum Isolation',
    description: 'Traditional bodybuilding routine dedicating intense focus to one major muscle group per training session.',
    days: ['Chest Day', 'Back Day', 'Shoulder Day', 'Leg Day', 'Arm Day (Biceps/Triceps)']
  },
  {
    id: 'full-body-3',
    name: 'Full Body Routine (3-Day)',
    frequency: 3,
    difficulty: 'Beginner - Intermediate',
    category: 'Time Efficient & Functional',
    description: 'Maximum bang-for-your-buck compound movements 3 days a week with rest days in between for optimal recovery.',
    days: ['Full Body Workout A', 'Full Body Workout B', 'Full Body Workout C']
  },
  {
    id: 'ppl-recovery-7',
    name: 'PPL + Active Recovery (7-Day)',
    frequency: 7,
    difficulty: 'Elite Athletes',
    category: 'High Volume',
    description: 'Relentless 6-day training with an active recovery, mobility, and core session on day seven.',
    days: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Active Recovery & Mobility']
  },
  {
    id: 'full-body-2',
    name: 'Express Full Body (2-Day)',
    frequency: 2,
    difficulty: 'Beginner / Busy Schedule',
    category: 'Minimalist Strength',
    description: 'Designed for busy athletes who want to maintain muscle and strength on a limited weekly schedule.',
    days: ['Full Body Heavy Compound', 'Full Body Hypertrophy']
  }
];

const transition = { duration: 0.28, ease: 'easeOut' };
const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 }
};

const SelectionCard = ({ selected, onClick, icon: Icon, title, detail }) => (
  <motion.button
    type="button"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`selection-card w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
      selected
        ? 'selection-card-selected border-red-500 bg-red-50 dark:bg-red-500/15 shadow-md shadow-red-500/10'
        : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 hover:border-slate-300 dark:hover:border-gray-500 shadow-sm'
    }`}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <span
          className={`selection-card-icon rounded-xl p-2 transition-colors ${
            selected
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0">
        <span
          className={`selection-card-title block font-bold transition-colors ${
            selected
              ? 'text-red-950 dark:text-white'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {title}
        </span>
        <span
          className={`selection-card-detail block text-sm transition-colors ${
            selected
              ? 'text-red-700 dark:text-red-300'
              : 'text-slate-500 dark:text-gray-400'
          }`}
        >
          {detail}
        </span>
      </span>
      {selected && (
        <Check className="selection-card-check ml-auto h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
      )}
    </div>
  </motion.button>
);

const Field = ({ label, suffix, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-gray-300">{label}</span>
    <span className="relative block">
      <input
        {...props}
        className="w-full rounded-xl border border-gray-700 bg-gray-950/80 px-4 py-3 pr-14 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">{suffix}</span>}
    </span>
  </label>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const initialUnits = user?.preferences?.units || 'metric';
  const existingMetrics = user?.metrics || {};
  const existingGoals = user?.fitnessGoals || {};
  const normalizedGoal = {
    lose: 'deficit',
    maintain: 'maintenance',
    gain: 'bulk',
    muscle: 'bulk'
  }[existingGoals.goal] || existingGoals.goal || '';
  const displayWeight = (weight) => {
    if (!weight) return '';
    return initialUnits === 'metric' ? weight : Number((weight * 2.20462).toFixed(1));
  };
  const displayHeight = () => {
    if (!existingMetrics.height) return '';
    if (initialUnits === 'metric') return existingMetrics.height;
    const totalInches = existingMetrics.height / 2.54;
    return `${Math.floor(totalInches / 12)}:${Math.round(totalInches % 12)}`;
  };

  const [selectedSplitOverride, setSelectedSplitOverride] = useState(() => {
    if (location.state?.selectedSplit) return location.state.selectedSplit;
    try {
      const saved = sessionStorage.getItem('grindx_onboarding_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedSplitOverride) return parsed.selectedSplitOverride;
      }
    } catch (e) {}
    return null;
  });

  const [showSplitBrowser, setShowSplitBrowser] = useState(false);
  const [splitFilter, setSplitFilter] = useState('all');

  const [step, setStep] = useState(() => {
    if (location.state?.resumeStep !== undefined) return location.state.resumeStep;
    if (location.state?.selectedSplit) return 7;
    try {
      const saved = sessionStorage.getItem('grindx_onboarding_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step !== undefined && !user?.onboardingCompleted) return parsed.step;
      }
    } catch (e) {}
    return 0;
  });

  const [units, setUnits] = useState(initialUnits);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState(0);

  const [view, setView] = useState(() => {
    if (location.state?.resumeStep !== undefined || location.state?.selectedSplit) return 'wizard';
    return user?.onboardingCompleted ? 'summary' : 'wizard';
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem('grindx_onboarding_draft');
      if (saved && !user?.onboardingCompleted) {
        const parsed = JSON.parse(saved);
        if (parsed.form) return parsed.form;
      }
    } catch (e) {}
    return {
      gender: existingMetrics.gender || '',
      age: existingMetrics.age || '',
      height: displayHeight(),
      currentWeight: displayWeight(existingMetrics.currentWeight),
      targetWeight: displayWeight(existingMetrics.targetWeight),
      goal: normalizedGoal,
      trainingFrequency: existingGoals.trainingFrequency || existingGoals.weeklyGoal || 4,
      experienceLevel: existingGoals.experienceLevel || 'beginner',
      activityLevel: existingGoals.activityLevel || ''
    };
  });

  // Handle incoming split or resume navigation from splits page
  useEffect(() => {
    if (location.state?.selectedSplit) {
      const split = location.state.selectedSplit;
      setSelectedSplitOverride(split);
      const freq = split.frequency ? parseInt(String(split.frequency).replace(/\D/g, ''), 10) : null;
      if (freq && freq >= 1 && freq <= 7) {
        setForm((prev) => ({ ...prev, trainingFrequency: freq }));
      }
      setStep(7);
      setView('wizard');
    } else if (location.state?.resumeStep !== undefined) {
      setStep(location.state.resumeStep);
      setView('wizard');
    }
  }, [location.state]);

  // Persist draft in sessionStorage so user never loses progress
  useEffect(() => {
    if (view === 'wizard') {
      try {
        sessionStorage.setItem('grindx_onboarding_in_progress', 'true');
        sessionStorage.setItem('grindx_onboarding_draft', JSON.stringify({
          form,
          step,
          units,
          selectedSplitOverride
        }));
      } catch (e) {}
    }
  }, [form, step, units, selectedSplitOverride, view]);

  const baseRecommendation = useMemo(
    () => getSplitRecommendation(form.trainingFrequency, form.experienceLevel),
    [form.trainingFrequency, form.experienceLevel]
  );

  const recommendation = useMemo(() => {
    if (selectedSplitOverride) {
      let days = [];
      if (selectedSplitOverride.weeklySchedule) {
        days = Object.entries(selectedSplitOverride.weeklySchedule)
          .filter(([_, desc]) => !String(desc).toLowerCase().includes('rest day'))
          .map(([_, desc]) => String(desc).split(' - ')[0] || String(desc));
      } else if (Array.isArray(selectedSplitOverride.days)) {
        days = selectedSplitOverride.days;
      }
      return {
        splitName: selectedSplitOverride.name || selectedSplitOverride.splitName,
        splitType: selectedSplitOverride.splitType || selectedSplitOverride.id || 'custom',
        days: days.length > 0 ? days : baseRecommendation.days,
        isCustomChosen: true
      };
    }
    return baseRecommendation;
  }, [selectedSplitOverride, baseRecommendation]);

  const filteredSplits = useMemo(() => {
    if (splitFilter === 'all') return AVAILABLE_SPLITS;
    const daysNum = parseInt(splitFilter, 10);
    return AVAILABLE_SPLITS.filter((s) => s.frequency === daysNum);
  }, [splitFilter]);

  useEffect(() => {
    if (step !== 6) return undefined;
    setAnalysisMessage(0);
    const messageTimer = window.setInterval(() => setAnalysisMessage((current) => Math.min(2, current + 1)), 1000);
    const timer = window.setTimeout(() => setStep(7), 3000);
    return () => { window.clearTimeout(timer); window.clearInterval(messageTimer); };
  }, [step]);

  const update = (field, value) => {
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const heightCm = () => {
    if (units === 'metric') return Number(form.height);
    const [feet = 0, inches = 0] = String(form.height).split(':').map(Number);
    return Number(((feet * 12 + inches) * 2.54).toFixed(1));
  };

  const weightKg = (value) => {
    if (value === '' || value === null) return null;
    return Number((units === 'metric' ? Number(value) : Number(value) / 2.20462).toFixed(1));
  };

  const validateStep = () => {
    if (step === 1 && (!form.gender || Number(form.age) < 13 || Number(form.age) > 100)) {
      return 'Choose a gender option and enter an age from 13 to 100.';
    }
    if (step === 2) {
      const height = heightCm();
      const weight = weightKg(form.currentWeight);
      if (!height || height < 100 || height > 250) return 'Enter a valid height.';
      if (!weight || weight < 30 || weight > 350) return 'Enter a valid current weight.';
      const target = weightKg(form.targetWeight);
      if (target !== null && (target < 30 || target > 350)) return 'Enter a valid target weight or leave it blank.';
    }
    if (step === 3 && !form.goal) return 'Choose the result you want to prioritize.';
    if (step === 4 && (!form.trainingFrequency || !form.experienceLevel)) return 'Choose your training commitment.';
    if (step === 5 && !form.activityLevel) return 'Choose your activity level.';
    return '';
  };

  const next = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (step === 5) {
      setStep(6);
    } else {
      setStep((current) => Math.min(7, current + 1));
    }
  };

  const back = () => {
    setError('');
    if (step === 7) {
      // Step 7 (8 of 8, Recommendation) -> Return to Step 5 (6 of 8, Activity level)
      // Allows user to review and modify their answers seamlessly without auto-timer loop
      setStep(5);
    } else if (step === 6) {
      setStep(5);
    } else {
      setStep((current) => Math.max(0, current - 1));
    }
  };

  const complete = async () => {
    setSubmitting(true);
    setCelebrating(true);
    setError('');
    try {
      const result = await submitOnboarding({
        metrics: {
          gender: form.gender,
          age: Number(form.age),
          height: heightCm(),
          currentWeight: weightKg(form.currentWeight),
          targetWeight: weightKg(form.targetWeight)
        },
        fitnessGoals: {
          goal: form.goal,
          experienceLevel: form.experienceLevel
        },
        trainingFrequency: Number(form.trainingFrequency),
        activityLevel: form.activityLevel
      });
      updateUser(result.user);
      sessionStorage.removeItem('grindx_onboarding_in_progress');
      sessionStorage.removeItem('grindx_onboarding_draft');
      window.dispatchEvent(new CustomEvent('plansUpdated', { detail: { plan: result.plan } }));
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setCelebrating(false);
      setError(requestError.message || 'Unable to finish onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetSetup = async () => {
    setResetting(true);
    setError('');
    try {
      const result = await resetOnboarding();
      sessionStorage.removeItem('grindx_onboarding_in_progress');
      sessionStorage.removeItem('grindx_onboarding_draft');
      setSelectedSplitOverride(null);
      updateUser(result.user);
      setForm({
        gender: '', age: '', height: '', currentWeight: '', targetWeight: '',
        goal: '', trainingFrequency: 4, experienceLevel: 'beginner', activityLevel: ''
      });
      setUnits(result.user?.preferences?.units || 'metric');
      setStep(0);
      setShowResetConfirm(false);
      setView('wizard');
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset fitness setup.');
    } finally {
      setResetting(false);
    }
  };

  const renderHeightFields = () => {
    if (units === 'metric') {
      return <Field label="Height" suffix="cm" type="number" min="100" max="250" value={form.height} onChange={(event) => update('height', event.target.value)} />;
    }
    const [feet = '', inches = ''] = String(form.height).split(':');
    return (
      <div className="grid grid-cols-2 gap-3">
        <Field label="Height" suffix="ft" type="number" min="3" max="8" value={feet} onChange={(event) => update('height', `${event.target.value}:${inches}`)} />
        <Field label="\u00a0" suffix="in" type="number" min="0" max="11" value={inches} onChange={(event) => update('height', `${feet}:${event.target.value}`)} />
      </div>
    );
  };

  if (view === 'summary') {
    const goal = goals.find((item) => item.value === form.goal);
    const activity = activityLevels.find((item) => item.value === form.activityLevel);
    const experience = experienceLevels.find((item) => item.value === form.experienceLevel);
    const summaryItems = [
      { label: 'Age', value: `${form.age || '--'} years`, icon: CalendarDays },
      { label: 'Gender', value: form.gender ? form.gender.replace(/^./, (letter) => letter.toUpperCase()) : '--', icon: User },
      { label: 'Height', value: form.height ? `${form.height} ${units === 'metric' ? 'cm' : 'ft / in'}` : '--', icon: Ruler },
      { label: 'Current weight', value: form.currentWeight ? `${form.currentWeight} ${units === 'metric' ? 'kg' : 'lb'}` : '--', icon: Scale },
      { label: 'Target weight', value: form.targetWeight ? `${form.targetWeight} ${units === 'metric' ? 'kg' : 'lb'}` : 'Not set', icon: Target },
      { label: 'Primary goal', value: goal?.label || '--', icon: Flame },
      { label: 'Training schedule', value: `${form.trainingFrequency} days per week`, icon: Dumbbell },
      { label: 'Experience', value: experience?.label || '--', icon: Activity },
      { label: 'Daily activity', value: activity?.label || '--', icon: Activity }
    ];

    const handleBack = () => {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    };

    return (
      <div className="onboarding-page fitness-profile-page relative -mx-4 min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="onboarding-backdrop absolute inset-0 bg-gradient-to-b from-gray-950/90 via-gray-900/95 to-black" />
        
        <div className="relative mx-auto max-w-4xl">
          {/* Top Navigation Row with Back Option */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="fitness-profile-back-btn group inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-gray-900/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-200 shadow-lg shadow-black/30 backdrop-blur-md transition-all duration-200 hover:-translate-x-0.5 hover:border-red-500/50 hover:bg-gray-800/95 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 active:scale-95"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Dashboard</span>
            </button>

            <div className="fitness-profile-status-pill inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Profile Active &amp; Synced</span>
            </div>
          </div>

          <div className="fitness-profile-card overflow-hidden rounded-3xl border border-white/10 bg-gray-900/85 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300">
            {/* Header Banner */}
            <div className="fitness-profile-header border-b border-white/10 bg-gradient-to-r from-red-950/50 via-gray-900/40 to-transparent p-6 sm:p-9">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="fitness-profile-icon-back inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-gray-300 transition duration-200 hover:border-red-500/40 hover:bg-red-500/15 hover:text-white"
                      title="Back to previous page"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Profile complete
                    </div>
                  </div>
                  <h1 className="text-3xl font-black text-white sm:text-5xl tracking-tight">Your fitness profile</h1>
                  <p className="mt-2 max-w-xl text-sm text-gray-300 sm:text-base leading-relaxed">
                    Your saved setup powers workout recommendations and nutrition targets. Review or update it at any time.
                  </p>
                </div>
                <div className="fitness-profile-sparkle-box flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-950/40 ring-1 ring-red-400/30">
                  <Sparkles className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-9">
              {/* Current Recommendation Bento Box */}
              <div className="fitness-profile-rec-box mb-6 rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-500/10 via-red-950/20 to-transparent p-5 sm:p-6 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Current recommendation</p>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">{recommendation.splitName}</h2>
                  <span className="inline-flex items-center rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                    {form.trainingFrequency} training days / week
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {recommendation.days.map((day, index) => (
                    <span
                      key={`${day}-${index}`}
                      className="fitness-profile-day-chip rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:border-red-500/30"
                    >
                      Day {index + 1}: {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* 9-Metric Bento Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {summaryItems.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="fitness-profile-metric-tile group rounded-2xl border border-white/10 bg-black/25 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-black/35"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <span className="fitness-profile-metric-icon flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/15 text-red-400 transition-colors group-hover:bg-red-500/25">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {label}
                    </div>
                    <p className="mt-2.5 font-bold text-white text-base sm:text-lg">{value}</p>
                  </div>
                ))}
              </div>

              {error && (
                <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="fitness-profile-btn-secondary rounded-xl border border-gray-700 px-5 py-3 font-bold text-gray-300 transition hover:border-red-500 hover:text-white active:scale-95"
                >
                  <RefreshCw className="mr-2 inline h-4 w-4" /> Reset setup
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(0); setView('wizard'); }}
                  className="fitness-profile-btn-primary rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-black text-white shadow-lg shadow-red-950/40 transition hover:from-red-500 hover:to-red-600 active:scale-95"
                >
                  <Pencil className="mr-2 inline h-4 w-4" /> Edit profile setup
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showResetConfirm && (
              <motion.div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !resetting && setShowResetConfirm(false)}>
                <motion.div role="dialog" aria-modal="true" aria-labelledby="reset-title" className="fitness-profile-modal w-full max-w-md rounded-3xl border border-red-500/25 bg-gray-900 p-6 shadow-2xl" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-400"><RefreshCw className="h-6 w-6" /></div>
                  <h2 id="reset-title" className="mt-5 text-2xl font-black text-white">Reset fitness setup?</h2>
                  <p className="mt-2 text-sm text-gray-300">This clears your profile answers and starts the setup again. Your workout history and existing plans will stay safe.</p>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" disabled={resetting} onClick={() => setShowResetConfirm(false)} className="rounded-xl border border-gray-700 px-5 py-3 font-bold text-gray-300 transition hover:border-gray-500 hover:text-white">Cancel</button>
                    <button type="button" disabled={resetting} onClick={resetSetup} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500 disabled:opacity-60">{resetting && <Loader2 className="h-4 w-4 animate-spin" />} Reset and start again</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  const panels = [
    <div className="text-center" key="welcome">
      <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600 shadow-2xl shadow-red-900/40">
        <Dumbbell className="h-10 w-10 text-white" />
      </motion.div>
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-400">Your training starts here</p>
      <h1 className="text-3xl font-black text-white sm:text-5xl">Welcome, {user?.name?.split(' ')[0] || 'Athlete'}!</h1>
      <p className="mx-auto mt-4 max-w-lg text-gray-300">Let&apos;s build your perfect plan, set your nutrition targets, and give every session a clear purpose.</p>
    </div>,
    <div key="basic">
      <User className="mb-4 h-8 w-8 text-red-400" />
      <h2 className="text-2xl font-black text-white sm:text-3xl">First, the basics</h2>
      <p className="mt-2 text-gray-400">These details keep your calorie calculation accurate.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['male', 'Male'],
          ['female', 'Female'],
          ['other', 'Prefer Not to Say']
        ].map(([value, label]) => (
          <SelectionCard key={value} selected={form.gender === value} onClick={() => update('gender', value)} title={label} detail="Select" />
        ))}
      </div>
      <div className="mt-5 max-w-xs"><Field label="Age" suffix="years" type="number" min="13" max="100" value={form.age} onChange={(event) => update('age', event.target.value)} /></div>
    </div>,
    <div key="metrics">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Ruler className="h-8 w-8 text-red-400" />
        <div className="flex rounded-lg bg-gray-950 p-1 text-sm">
          {['metric', 'imperial'].map((unit) => (
            <button key={unit} type="button" onClick={() => { update('height', ''); update('currentWeight', ''); update('targetWeight', ''); setUnits(unit); }} className={`rounded-md px-3 py-1.5 capitalize ${units === unit ? 'bg-red-600 text-white' : 'text-gray-400'}`}>{unit}</button>
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-black text-white sm:text-3xl">Body metrics</h2>
      <p className="mt-2 text-gray-400">Stored in metric units so progress stays consistent everywhere.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {renderHeightFields()}
        <Field label="Current weight" suffix={units === 'metric' ? 'kg' : 'lb'} type="number" min="1" step="0.1" value={form.currentWeight} onChange={(event) => update('currentWeight', event.target.value)} />
        <Field label="Target weight (optional)" suffix={units === 'metric' ? 'kg' : 'lb'} type="number" min="1" step="0.1" value={form.targetWeight} onChange={(event) => update('targetWeight', event.target.value)} />
      </div>
    </div>,
    <div key="goal">
      <Flame className="mb-4 h-8 w-8 text-red-400" />
      <h2 className="text-2xl font-black text-white sm:text-3xl">What&apos;s the mission?</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {goals.map((goal) => <SelectionCard key={goal.value} selected={form.goal === goal.value} onClick={() => update('goal', goal.value)} icon={goal.icon} title={goal.label} detail={goal.detail} />)}
      </div>
    </div>,
    <div key="commitment">
      <Dumbbell className="mb-4 h-8 w-8 text-red-400" />
      <h2 className="text-2xl font-black text-white sm:text-3xl">How often can you train?</h2>
      <div className="mt-7 rounded-2xl border border-gray-700 bg-gray-950/70 p-5">
        <div className="flex items-end justify-between"><span className="text-gray-300">Days per week</span><span className="text-4xl font-black text-red-400">{form.trainingFrequency}</span></div>
        <input aria-label="Training days per week" className="mt-4 w-full accent-red-600" type="range" min="1" max="7" value={form.trainingFrequency} onChange={(event) => update('trainingFrequency', Number(event.target.value))} />
        <p className="mt-4 text-sm text-gray-300">We&apos;ll recommend <strong className="text-white">{recommendation.splitName}</strong>.</p>
      </div>
      <p className="mb-3 mt-6 text-sm font-semibold text-gray-300">Training experience</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {experienceLevels.map((level) => <SelectionCard key={level.value} selected={form.experienceLevel === level.value} onClick={() => update('experienceLevel', level.value)} title={level.label} detail={level.detail} />)}
      </div>
    </div>,
    <div key="activity">
      <Activity className="mb-4 h-8 w-8 text-red-400" />
      <h2 className="text-2xl font-black text-white sm:text-3xl">Daily activity level</h2>
      <p className="mt-2 text-gray-400">Count life outside planned workouts.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {activityLevels.map((level) => <SelectionCard key={level.value} selected={form.activityLevel === level.value} onClick={() => update('activityLevel', level.value)} title={level.label} detail={level.detail} />)}
      </div>
    </div>,
    <div className="py-10 text-center" key="analyzing">
      <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/40"><Brain className="h-10 w-10 text-red-400" /></motion.div>
      <h2 className="mt-6 text-2xl font-black text-white">Analyzing your profile?</h2>
      <motion.div className="mx-auto mt-6 h-2 max-w-sm overflow-hidden rounded-full bg-gray-800"><motion.div className="h-full bg-gradient-to-r from-red-700 to-red-400" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, ease: 'linear' }} /></motion.div>
      <motion.p key={analysisMessage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-gray-400">{['Analyzing body composition...','Calculating optimal split...','Building your plan...'][analysisMessage]}</motion.p>
    </div>,
    <div className="relative text-center" key="reveal">
      {celebrating && Array.from({ length: 18 }).map((_, index) => <motion.span key={index} className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-red-400" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: (index % 6 - 2.5) * 55, y: -80 - (index % 3) * 45, opacity: 0 }} transition={{ duration: 1.2, delay: index * 0.025 }} />)}
      <Sparkles className="mx-auto h-10 w-10 text-red-400" />
      {selectedSplitOverride ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Selected Training Split
          </span>
          <button
            type="button"
            onClick={() => setSelectedSplitOverride(null)}
            className="text-xs text-gray-500 hover:text-red-500 underline transition"
          >
            Revert to AI suggestion
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.25em] text-red-400">Your recommended split</p>
      )}
      <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">{recommendation.splitName}</h2>
      <p className="mt-3 text-gray-300">{form.trainingFrequency} focused training days per week</p>
      <div className="mt-7 grid gap-2 sm:grid-cols-2">
        {recommendation.days.map((day, index) => <div key={`${day}-${index}`} className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-950/70 p-3 text-left"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-sm font-black text-red-400">{index + 1}</span><span className="font-semibold text-white">{day}</span></div>)}
      </div>
    </div>
  ];

  return (
    <div className="onboarding-page relative -mx-4 min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${heroImg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/90 via-gray-900/95 to-black" />
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="fitness-profile-back-btn group inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-white/15 bg-gray-900/80 px-3 py-2 text-xs font-bold text-gray-200 shadow-md backdrop-blur-md transition-all hover:border-red-500/40 hover:bg-gray-800 hover:text-white active:scale-95"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Previous Step</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (user?.onboardingCompleted) {
                  setView('summary');
                } else if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate('/dashboard');
                }
              }}
              className="fitness-profile-back-btn group inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-gray-400 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white active:scale-95"
              aria-label="Exit setup"
              title="Exit onboarding setup"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">{user?.onboardingCompleted ? 'Profile' : 'Dashboard'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            <span>Setup Step</span>
            <span className="rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-600/20 dark:text-red-400 dark:border-red-500/30 px-2.5 py-0.5 font-black">{step + 1} of {TOTAL_STEPS}</span>
          </div>
        </div>
        <div className="mb-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-800"><motion.div className="h-full bg-red-600" animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} transition={transition} /></div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gray-900/80 p-5 sm:p-10 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <AnimatePresence mode="wait"><motion.section key={step} {...slide} transition={transition}>{panels[step]}</motion.section></AnimatePresence>
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}
          
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-6">
            <div>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900/80 px-5 py-3 text-sm font-bold text-gray-300 transition hover:border-gray-500 hover:bg-gray-800 hover:text-white active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <span />
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {step < 6 && (
                <button
                  type="button"
                  onClick={next}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 active:scale-95"
                >
                  <span>{step === 0 ? "Let's Go" : 'Next Step'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {step === 6 && (
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-500 active:scale-95 shadow-lg shadow-red-950/40"
                >
                  <span>View Recommendation</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}

              {step === 7 && (
                <>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowSplitBrowser(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900/80 px-5 py-3 text-sm font-bold text-gray-300 transition hover:border-red-500/50 hover:bg-gray-800 hover:text-white active:scale-95"
                  >
                    <Dumbbell className="h-4 w-4 text-red-500" />
                    <span>{selectedSplitOverride ? 'Choose Different Split' : 'Browse Other Splits'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={complete}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>Accept &amp; Start</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500"><Scale className="h-4 w-4" /> Your metrics stay private and are used only for your plan.</div>
      </div>

      {/* In-Wizard Browse Other Splits Modal: 100% Responsive & Premium */}
      <AnimatePresence>
        {showSplitBrowser && (
          <motion.div
            className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSplitBrowser(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="split-browser-title"
              className="split-browser-modal relative flex h-[88vh] max-h-[780px] w-full max-w-4xl flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-gray-900 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header: fixed */}
              <div className="flex-none flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                    <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 id="split-browser-title" className="text-base sm:text-xl font-black text-white truncate">
                        Browse Workout Splits
                      </h3>
                      <span className="hidden sm:inline-flex rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                        Profile Setup
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                      Choose any training split without exiting setup
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => window.open('/splits', '_blank')}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition"
                    title="Open full splits catalog in a new tab"
                  >
                    <span>Catalog</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSplitBrowser(false)}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition active:scale-95"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Filter Bar: fixed */}
              <div className="split-filter-bar flex-none flex items-center gap-1.5 sm:gap-2 overflow-x-auto border-b border-white/10 px-4 py-2 sm:px-6">
                {['all', '2', '3', '4', '5', '6', '7'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSplitFilter(f)}
                    className={`split-filter-btn shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                      splitFilter === f
                        ? 'active bg-red-600 text-white shadow-md shadow-red-950/40 border border-red-500'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {f === 'all' ? 'All Splits' : `${f} Days/Wk`}
                  </button>
                ))}
              </div>

              {/* Splits Grid: smooth vertical scroll */}
              <div className="split-cards-container flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3.5 min-h-0">
                {filteredSplits.map((split) => {
                  const isCurrentlySelected = selectedSplitOverride
                    ? (selectedSplitOverride.id === split.id || selectedSplitOverride.name === split.name)
                    : (recommendation.splitName === split.name);

                  return (
                    <div
                      key={split.id}
                      className={`split-browser-card group relative flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 ${
                        isCurrentlySelected
                          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-950/30'
                          : 'border-white/10 bg-gray-950/60 hover:border-red-500/40 hover:bg-gray-950/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="rounded-md bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400">
                                {split.frequency} Days/Week
                              </span>
                              <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                                {split.difficulty}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                              {split.name}
                            </h4>
                          </div>
                          {isCurrentlySelected && (
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm shrink-0">
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-gray-400 leading-relaxed line-clamp-2">
                          {split.description}
                        </p>

                        {/* Day schedule pill list */}
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {split.days.map((dayName, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-gray-300"
                            >
                              <span className="text-red-400 font-bold mr-1">{idx + 1}</span>
                              {dayName.split('(')[0].trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate max-w-[130px] sm:max-w-none">
                          {split.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSplitOverride(split);
                            setForm((prev) => ({ ...prev, trainingFrequency: split.frequency }));
                            setShowSplitBrowser(false);
                          }}
                          className={`rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shrink-0 ${
                            isCurrentlySelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-950/40'
                          }`}
                        >
                          <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>{isCurrentlySelected ? 'Selected' : 'Select This Split'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer: fixed */}
              <div className="flex-none flex items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2.5 sm:px-6 sm:py-3 text-[11px] sm:text-xs text-gray-400">
                <span className="truncate pr-2">Selecting updates your setup without leaving.</span>
                <button
                  type="button"
                  onClick={() => setShowSplitBrowser(false)}
                  className="rounded-xl border border-white/15 px-3.5 py-1.5 font-bold text-gray-300 hover:text-white hover:border-white/30 transition shrink-0 active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
