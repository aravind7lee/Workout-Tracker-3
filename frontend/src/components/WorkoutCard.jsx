// frontend/src/components/WorkoutCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

export default function WorkoutCard({ workout }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-md border border-slate-800">
      <div className="flex justify-between">
        <div>
          <div className="text-sm text-slate-400">{dayjs(workout.date).format('DD MMM YYYY')}</div>
          <div className="font-semibold mt-1">{workout.title || 'Workout'}</div>
        </div>
        <div className="text-slate-300">{workout.exercises?.length || 0} exercises</div>
      </div>
    </motion.div>
  );
}
