"use client";

import { Star } from "lucide-react";

export function RatingSummaryWidget({ 
  rating, 
  totalReviews, 
  ratingCounts 
}: { 
  rating: number; 
  totalReviews: number;
  ratingCounts?: Record<number, number>;
}) {
  const counts = ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
      {/* Overall Score */}
      <div className="flex flex-col items-center flex-shrink-0">
        <span className="text-5xl font-extrabold text-slate-900 mb-2">{rating.toFixed(1)}</span>
        <div className="flex mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-slate-500 font-medium">{totalReviews} Ratings</span>
      </div>

      {/* Distribution Bars */}
      <div className="flex-1 w-full flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = counts[stars] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700 w-3">{stars}</span>
              <Star className="w-3.5 h-3.5 text-slate-400 fill-slate-400 flex-shrink-0" />
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
