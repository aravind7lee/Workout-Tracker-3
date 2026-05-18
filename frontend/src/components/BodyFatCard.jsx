import React from "react";

const BodyFatCard = ({ bf, OptimizedImage }) => {
  const colorClasses = {
    red: {
      border: "border-red-500",
      text: "text-red-500",
      bg: "bg-red-500/10",
      shadow: "shadow-red-500/30",
    },
    orange: {
      border: "border-orange-500",
      text: "text-orange-500",
      bg: "bg-orange-500/10",
      shadow: "shadow-orange-500/30",
    },
    yellow: {
      border: "border-yellow-500",
      text: "text-yellow-500",
      bg: "bg-yellow-500/10",
      shadow: "shadow-yellow-500/30",
    },
    lime: {
      border: "border-lime-500",
      text: "text-lime-500",
      bg: "bg-lime-500/10",
      shadow: "shadow-lime-500/30",
    },
    green: {
      border: "border-red-600",
      text: "text-red-600",
      bg: "bg-red-600/10",
      shadow: "shadow-red-600/30",
    },
    blue: {
      border: "border-red-600",
      text: "text-red-600",
      bg: "bg-red-600/10",
      shadow: "shadow-red-600/30",
    },
    purple: {
      border: "border-red-700",
      text: "text-red-700",
      bg: "bg-red-700/10",
      shadow: "shadow-red-700/30",
    },
  };

  const colors = colorClasses[bf.color] || colorClasses.red;

  return (
    <div className="relative group transform transition-all duration-300 hover:translate-y-[-4px] w-full h-full">
      <div
        className={`relative bg-zinc-900 border-2 ${colors.border} shadow-2xl overflow-hidden group-hover:border-red-600 transition-all duration-300 h-full`}
      >
        <div className="relative h-[300px] overflow-hidden bg-black">
          <OptimizedImage
            src={bf.img}
            alt={`Body Fat ${bf.percent}%`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Top-Left Corner: Perfect Glowing Double-Ring HUD Percentage Circle */}
          <div className={`absolute top-3 left-3 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 ${colors.border} flex items-center justify-center bg-black/50 backdrop-blur-md shadow-lg ${colors.shadow} transition-all duration-300 group-hover:scale-110`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-950 flex items-center justify-center border border-neutral-850">
              <span className={`text-[10px] sm:text-[12px] font-black tracking-tighter ${colors.text}`}>
                {bf.percent}%
              </span>
            </div>
          </div>

          {/* Bottom-Right Corner: Glowing Border Condition Badge */}
          <div className={`absolute bottom-3 right-3 z-20 bg-zinc-950/90 backdrop-blur-md border-2 ${colors.border} px-3 py-1 rounded-full shadow-lg ${colors.shadow} flex items-center justify-center`}>
            <span className={`text-[9px] sm:text-[11px] font-black tracking-wider uppercase flex items-center gap-1 leading-none ${colors.text}`}>
              {bf.health}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col justify-start gap-2.5 h-[calc(100%-300px)]">
          <h3 className="text-sm sm:text-base font-black text-white uppercase leading-tight group-hover:text-red-600 transition-colors duration-300">
            {bf.title}
          </h3>

          <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-medium">
            {bf.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BodyFatCard;
