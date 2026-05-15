"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createShopReview, createProductReview } from "@/app/actions/reviews";

export function ReviewForm({
  type,
  targetId,
  onSuccess,
}: {
  type: "shop" | "product";
  targetId: string;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    
    setSubmitting(true);
    let res;
    
    if (type === "shop") {
      res = await createShopReview({ shopId: targetId, rating, title, body });
    } else {
      res = await createProductReview({ productId: targetId, rating, title, body });
    }

    setSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Review submitted! Thank you for your feedback.");
      setRating(0);
      setTitle("");
      setBody("");
      if (onSuccess) onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl w-full">
      <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>
      
      {/* Star Selector */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-semibold text-slate-700">Rating:</label>
        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              className="p-1"
              onMouseEnter={() => setHoverRating(i + 1)}
              onClick={() => setRating(i + 1)}
            >
              <Star
                className={`w-6 h-6 ${(hoverRating || rating) > i ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            className="w-full text-sm border-slate-200 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Details (Optional)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell us more about your experience..."
            className="w-full text-sm border-slate-200 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            rows={4}
            maxLength={2000}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="mt-4 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 hover:bg-brand-700 transition"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Review"}
      </button>
    </form>
  );
}
