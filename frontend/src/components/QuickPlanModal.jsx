// Quick Plan Modal Component
import React, { useState } from "react";

const QuickPlanModal = ({ exercise, onClose, onSave }) => {
  const [planName, setPlanName] = useState(`${exercise.name} Workout`);
  const [planDescription, setPlanDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const newPlan = {
        id: Date.now(),
        name: planName,
        description: planDescription,
        exercises: [exercise],
        createdAt: new Date().toISOString(),
        isCustom: true,
      };

      // Save to localStorage for now
      const savedPlans = JSON.parse(localStorage.getItem("userPlans") || "[]");
      savedPlans.push(newPlan);
      localStorage.setItem("userPlans", JSON.stringify(savedPlans));

      onSave(newPlan);
      onClose();
    } catch (error) {
      console.error("Failed to save plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="card max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Create Quick Plan
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-lg">
            <div
              className={`w-10 h-10 ${exercise.color} rounded-lg flex items-center justify-center`}
            >
              <span className="text-xl">{exercise.icon}</span>
            </div>
            <div>
              <div className="font-medium text-white">{exercise.name}</div>
              <div className="text-sm text-neutral-400">
                {exercise.category}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white"
              placeholder="Enter plan name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white"
              rows={3}
              placeholder="Describe your workout plan..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !planName.trim()}
              className="btn bg-red-700 hover:bg-blue-700 text-white flex-1 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPlanModal;
