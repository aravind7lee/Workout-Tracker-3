// frontend/src/components/NutritionPreviewModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NutritionPreviewModal({ 
  isOpen, 
  onClose, 
  nutritionItems, 
  onConfirm, 
  isAdding 
}) {
  const [selectedItem, setSelectedItem] = useState(0);
  const [customGrams, setCustomGrams] = useState('');
  const [mealType, setMealType] = useState('snack');

  if (!isOpen || !nutritionItems || nutritionItems.length === 0) {
    return null;
  }

  const currentItem = nutritionItems[selectedItem];
  const displayItem = customGrams ? 
    scaleNutrition(currentItem, parseFloat(customGrams)) : 
    currentItem;

  function scaleNutrition(item, targetGrams) {
    const scale = targetGrams / item.servingGrams;
    return {
      ...item,
      servingText: `${targetGrams} g`,
      servingGrams: targetGrams,
      multiplier: scale,
      calories: Math.round(item.calories * scale),
      protein: Math.round(item.protein * scale * 10) / 10,
      carbs: Math.round(item.carbs * scale * 10) / 10,
      fat: Math.round(item.fat * scale * 10) / 10,
      fiber: Math.round((item.fiber || 0) * scale * 10) / 10,
      sugar: Math.round((item.sugar || 0) * scale * 10) / 10,
      sodium: Math.round((item.sodium || 0) * scale * 10) / 10
    };
  }

  const handleConfirm = () => {
    const finalItem = {
      ...displayItem,
      mealType,
      rawQuery: currentItem.meta?.originalQuery || currentItem.parsedName
    };
    
    onConfirm(finalItem);
    onClose();
    setCustomGrams('');
    setSelectedItem(0);
    setMealType('snack');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Confirm Nutrition</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Multiple items selector */}
              {nutritionItems.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select food item:
                  </label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(parseInt(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {nutritionItems.map((item, index) => (
                      <option key={index} value={index}>
                        {item.parsedName} ({item.servingText})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Food info */}
              <div className="bg-slate-700/30 rounded-lg p-3">
                <h4 className="font-medium text-white capitalize mb-2">
                  {displayItem.parsedName}
                </h4>
                <p className="text-sm text-slate-400 mb-3">
                  Serving: {displayItem.servingText}
                </p>
                
                {/* Nutrition grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-white font-medium text-lg">{displayItem.calories}</div>
                    <div className="text-slate-400">calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-medium">{displayItem.protein}g</div>
                    <div className="text-slate-400">protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-medium">{displayItem.carbs}g</div>
                    <div className="text-slate-400">carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-medium">{displayItem.fat}g</div>
                    <div className="text-slate-400">fat</div>
                  </div>
                </div>
              </div>
              
              {/* Custom quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Adjust quantity (grams):
                </label>
                <input
                  type="number"
                  value={customGrams}
                  onChange={(e) => setCustomGrams(e.target.value)}
                  placeholder={currentItem.servingGrams.toString()}
                  min="1"
                  max="2000"
                  className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
                />
                <div className="text-xs text-slate-500 mt-1">
                  Leave empty to use default serving size
                </div>
              </div>
              
              {/* Meal type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Meal type:
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snack">🍿 Snack</option>
                </select>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isAdding}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isAdding ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Adding...
                  </div>
                ) : (
                  'Add Meal'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}