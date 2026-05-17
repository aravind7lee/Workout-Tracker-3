import React from 'react';

const BodyFatCard = ({ bf, OptimizedImage }) => {
  const colorClasses = {
    red: {
      border: 'border-red-500',
      text: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    orange: {
      border: 'border-orange-500',
      text: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    yellow: {
      border: 'border-yellow-500',
      text: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    lime: {
      border: 'border-lime-500',
      text: 'text-lime-500',
      bg: 'bg-lime-500/10'
    },
    green: {
      border: 'border-red-600',
      text: 'text-red-600',
      bg: 'bg-red-600/10'
    },
    blue: {
      border: 'border-red-600',
      text: 'text-red-600',
      bg: 'bg-red-600/10'
    },
    purple: {
      border: 'border-red-700',
      text: 'text-red-700',
      bg: 'bg-red-700/10'
    }
  };

  const colors = colorClasses[bf.color] || colorClasses.red;

  return (
    <div className="relative group transform transition-all duration-300 hover:translate-y-[-4px]">
      <div className={`relative bg-zinc-900 border-2 ${colors.border} shadow-2xl overflow-hidden group-hover:border-red-600 transition-all duration-300`}>
        <div className="relative h-[280px] sm:h-[350px] overflow-hidden bg-black">
          <OptimizedImage 
            src={bf.img} 
            alt={`Body Fat ${bf.percent}%`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <div className={`bg-black/90 border-2 ${colors.border} px-3 py-2 sm:px-4 sm:py-3`}>
              <div className={`${colors.text} text-xl sm:text-3xl font-black leading-none`}>{bf.percent}%</div>
              <div className="text-white text-[8px] sm:text-xs font-black uppercase tracking-wide mt-1">Body Fat</div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
            <div className="bg-black/90 border border-white px-3 py-2 sm:px-4 sm:py-2">
              <div className="text-white text-[10px] sm:text-sm font-black uppercase tracking-wide">{bf.health}</div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-base font-black text-white uppercase leading-tight group-hover:text-red-600 transition-colors duration-300">
            {bf.title}
          </h3>
          
          <p className="text-[11px] sm:text-sm text-zinc-400 leading-relaxed font-medium">
            {bf.desc}
          </p>

          <div className="pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs text-zinc-500 font-bold uppercase">Condition</span>
              <div className={`px-2 py-1 ${colors.bg} border ${colors.border}`}>
                <span className={`text-[9px] sm:text-xs ${colors.text} font-black uppercase`}>
                  {bf.percent >= 30 ? 'CUTTING NEEDED' : bf.percent >= 15 ? 'MAINTAINABLE' : bf.percent >= 10 ? 'LEAN' : 'EXTREME'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyFatCard;
