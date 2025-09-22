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
            className="relative w-full max-w-md nutrition-modal-bg rounded-xl nutrition-modal-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 nutrition-modal-header">
              <h3 className="text-lg font-semibold nutrition-modal-title">Confirm Nutrition</h3>
              <button
                onClick={onClose}
                className="nutrition-modal-close p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Multiple items selector */}
              {nutritionItems.length > 1 && (
                <div>
                  <label className="block text-sm font-medium nutrition-modal-label mb-2">
                    Select food item:
                  </label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(parseInt(e.target.value))}
                    className="w-full p-2 rounded-lg nutrition-modal-input focus:outline-none"
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
              <div className="nutrition-info-card rounded-lg p-3">
                <h4 className="font-medium nutrition-modal-title capitalize mb-2">
                  {displayItem.parsedName}
                </h4>
                <p className="text-sm nutrition-modal-muted mb-3">
                  Serving: {displayItem.servingText}
                </p>
                
                {/* Nutrition grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="nutrition-modal-title font-medium text-lg">{displayItem.calories}</div>
                    <div className="nutrition-modal-muted">calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-medium preserve-color">{displayItem.protein}g</div>
                    <div className="nutrition-modal-muted">protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-medium preserve-color">{displayItem.carbs}g</div>
                    <div className="nutrition-modal-muted">carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-medium preserve-color">{displayItem.fat}g</div>
                    <div className="nutrition-modal-muted">fat</div>
                  </div>
                </div>
              </div>
              
              {/* Custom quantity */}
              <div>
                <label className="block text-sm font-medium nutrition-modal-label mb-2">
                  Adjust quantity (grams):
                </label>
                <input
                  type="number"
                  value={customGrams}
                  onChange={(e) => setCustomGrams(e.target.value)}
                  placeholder={currentItem.servingGrams.toString()}
                  min="1"
                  max="2000"
                  className="w-full p-2 rounded-lg nutrition-modal-input focus:outline-none"
                />
                <div className="text-xs nutrition-modal-hint mt-1">
                  Leave empty to use default serving size
                </div>
              </div>
              
              {/* Meal type */}
              <div>
                <label className="block text-sm font-medium nutrition-modal-label mb-2">
                  Meal type:
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full p-2 rounded-lg nutrition-modal-input focus:outline-none"
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snack">🍿 Snack</option>
                </select>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex gap-3 p-4 nutrition-modal-footer">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 nutrition-modal-cancel rounded-lg transition-colors"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isAdding}
                className="flex-1 px-4 py-2 nutrition-modal-confirm rounded-lg transition-colors disabled:opacity-50"
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