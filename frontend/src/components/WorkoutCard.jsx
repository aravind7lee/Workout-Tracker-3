// frontend/src/components/WorkoutCard.jsx
import React from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";

export default function WorkoutCard({ workout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-md border border-neutral-900"
    >
      <div className="flex justify-between">
        <div>
          <div className="text-sm text-neutral-400">
            {dayjs(workout.date).format("DD MMM YYYY")}
          </div>
          <div className="font-semibold mt-1">{workout.title || "Workout"}</div>
        </div>
        <div className="text-neutral-300">
          {workout.exercises?.length || 0} exercises
        </div>
      </div>
    </motion.div>
  );
}
