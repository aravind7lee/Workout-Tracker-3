import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Brain,
  Check,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Loader2,
  Pencil,
  RefreshCw,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
      selected
        ? 'border-red-500 bg-red-500/15 shadow-lg shadow-red-950/30'
        : 'border-gray-700 bg-gray-900/70 hover:border-gray-500'
    }`}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <span className={`rounded-xl p-2 ${selected ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-bold text-white">{title}</span>
        <span className="block text-sm text-gray-400">{detail}</span>
      </span>
      {selected && <Check className="ml-auto h-5 w-5 shrink-0 text-red-400" />}
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
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState(initialUnits);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState(0);
  const [view, setView] = useState(user?.onboardingCompleted ? 'summary' : 'wizard');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form, setForm] = useState({
    gender: existingMetrics.gender || '',
    age: existingMetrics.age || '',
    height: displayHeight(),
    currentWeight: displayWeight(existingMetrics.currentWeight),
    targetWeight: displayWeight(existingMetrics.targetWeight),
    goal: normalizedGoal,
    trainingFrequency: existingGoals.trainingFrequency || existingGoals.weeklyGoal || 4,
    experienceLevel: existingGoals.experienceLevel || 'beginner',
    activityLevel: existingGoals.activityLevel || ''
  });

  const recommendation = useMemo(
    () => getSplitRecommendation(form.trainingFrequency, form.experienceLevel),
    [form.trainingFrequency, form.experienceLevel]
  );

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
    setStep((current) => Math.min(7, current + 1));
  };

  const back = () => {
    setError('');
    setStep((current) => Math.max(0, current - 1));
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

    return (
      <div className="onboarding-page relative -mx-4 min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/90 via-gray-900/95 to-black" />
        <div className="relative mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gray-900/85 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="border-b border-white/10 bg-gradient-to-r from-red-950/50 via-transparent to-transparent p-6 sm:p-9">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400"><Check className="h-3.5 w-3.5" /> Profile complete</div>
                  <h1 className="text-3xl font-black text-white sm:text-5xl">Your fitness profile</h1>
                  <p className="mt-2 max-w-xl text-sm text-gray-300 sm:text-base">Your saved setup powers workout recommendations and nutrition targets. Review or update it at any time.</p>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-950/40"><Sparkles className="h-8 w-8" /></div>
              </div>
            </div>

            <div className="p-6 sm:p-9">
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Current recommendation</p>
                <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-2xl font-black text-white">{recommendation.splitName}</h2>
                  <span className="text-sm font-semibold text-gray-300">{form.trainingFrequency} training days</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">{recommendation.days.map((day, index) => <span key={`${day}-${index}`} className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-gray-200">Day {index + 1}: {day}</span>)}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {summaryItems.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500"><Icon className="h-4 w-4 text-red-400" />{label}</div>
                    <p className="mt-2 font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowResetConfirm(true)} className="rounded-xl border border-gray-700 px-5 py-3 font-bold text-gray-300 transition hover:border-red-500 hover:text-white"><RefreshCw className="mr-2 inline h-4 w-4" /> Reset setup</button>
                <button type="button" onClick={() => { setStep(0); setView('wizard'); }} className="rounded-xl bg-red-600 px-6 py-3 font-black text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500"><Pencil className="mr-2 inline h-4 w-4" /> Edit profile setup</button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showResetConfirm && (
              <motion.div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !resetting && setShowResetConfirm(false)}>
                <motion.div role="dialog" aria-modal="true" aria-labelledby="reset-title" className="w-full max-w-md rounded-3xl border border-red-500/25 bg-gray-900 p-6 shadow-2xl" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-400"><RefreshCw className="h-6 w-6" /></div>
                  <h2 id="reset-title" className="mt-5 text-2xl font-black text-white">Reset fitness setup?</h2>
                  <p className="mt-2 text-sm text-gray-300">This clears your profile answers and starts the setup again. Your workout history and existing plans will stay safe.</p>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={resetting} onClick={() => setShowResetConfirm(false)} className="rounded-xl border border-gray-700 px-5 py-3 font-bold text-gray-300">Cancel</button><button type="button" disabled={resetting} onClick={resetSetup} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black text-white disabled:opacity-60">{resetting && <Loader2 className="h-4 w-4 animate-spin" />} Reset and start again</button></div>
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
      <p className="mt-3 text-sm font-bold uppercase tracking-[0.25em] text-red-400">Your recommended split</p>
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
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500"><span>Profile setup</span><span>{step + 1} / {TOTAL_STEPS}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-800"><motion.div className="h-full bg-red-600" animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} transition={transition} /></div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gray-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
          <AnimatePresence mode="wait"><motion.section key={step} {...slide} transition={transition}>{panels[step]}</motion.section></AnimatePresence>
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}
          {step !== 6 && (
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {step > 0 && step < 7 ? <button type="button" onClick={back} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 px-5 py-3 font-bold text-gray-300 transition hover:border-gray-500 hover:text-white"><ChevronLeft className="h-4 w-4" /> Back</button> : <span />}
              {step < 6 && <button type="button" onClick={next} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500">{step === 0 ? "Let's Go" : 'Next'} <ChevronRight className="h-4 w-4" /></button>}
              {step === 7 && <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={submitting} onClick={() => navigate('/splits', { state: { fromOnboarding: true } })} className="rounded-xl border border-gray-700 px-5 py-3 font-bold text-gray-300 transition hover:border-gray-500 hover:text-white">Browse Other Splits</button><button type="button" disabled={submitting} onClick={complete} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-black text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Accept &amp; Start</button></div>}
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500"><Scale className="h-4 w-4" /> Your metrics stay private and are used only for your plan.</div>
      </div>
    </div>
  );
};

export default Onboarding;
