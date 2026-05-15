"use client";

import { useState } from "react";
import { Star, CheckCircle, ThumbsUp, Flag, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { toggleReviewVote, reportReview } from "@/app/actions/reviews";

export function PublicReviewItem({ review, type }: { review: any; type: "shop" | "product" }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false); // simplistic state, usually derived from server if user is logged in
  const [reporting, setReporting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  async function handleVote() {
    if (voting) return;
    setVoting(true);
    const res = await toggleReviewVote(review.id, type, true);
    setVoting(false);

    if (res?.error) {
       toast.error(res.error);
    } else {
       if (res?.voted) {
           setHelpfulCount((c: number) => c + 1);
           setVoted(true);
       } else {
           setHelpfulCount((c: number) => Math.max(0, c - 1));
           setVoted(false);
       }
    }
  }

  async function handleReport() {
    if (!reportReason.trim() || reporting) return;
    setReporting(true);
    const res = await reportReview(review.id, type, reportReason);
    setReporting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Review reported. Our team will review it shortly.");
      setReportOpen(false);
      setReportReason("");
    }
  }

  return (
    <div className="border-b border-slate-50 py-5 last:border-0 last:pb-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0">
          {review.user.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-900">
              {review.user.name}
            </span>
            {review.isVerifiedPurchase && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 font-medium">
                <CheckCircle className="w-3 h-3" /> Verified Purchase
              </span>
            )}
            <span className="text-xs text-slate-400 ml-auto">
                {formatDistanceToNow(new Date(review.createdAt))} ago
            </span>
          </div>

          <div className="flex mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < review.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
          
          {review.title && (
            <p className="text-sm font-semibold text-slate-800 mb-1">{review.title}</p>
          )}
          {review.body && (
            <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>
          )}

          {/* Seller Reply */}
          {review.reply && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border-l-2 border-brand-300">
              <p className="text-xs font-bold text-brand-700 mb-1">Reply from seller</p>
              <p className="text-sm text-slate-700">{review.reply.body}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
             <button 
                onClick={handleVote}
                disabled={voting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
                  voted 
                     ? 'bg-brand-50 border-brand-200 text-brand-700' 
                     : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
               <ThumbsUp className="w-3.5 h-3.5" /> 
               {helpfulCount > 0 ? `Helpful (${helpfulCount})` : 'Helpful'}
             </button>

             <div className="relative">
                <button 
                  onClick={() => setReportOpen(!reportOpen)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>

                {reportOpen && (
                  <div className="absolute top-full mt-2 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-10 left-0">
                     <p className="text-xs font-bold text-slate-900 mb-2">Report Review</p>
                     <textarea 
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Reason for reporting..."
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs mb-2 outline-none focus:border-brand-400"
                        rows={3}
                     />
                     <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => setReportOpen(false)}
                           className="text-xs text-slate-500 hover:text-slate-700"
                         >
                            Cancel
                         </button>
                         <button 
                           onClick={handleReport}
                           disabled={reporting || !reportReason.trim()}
                           className="text-xs bg-red-500 text-white px-3 py-1.5 rounded disabled:opacity-50"
                         >
                            {reporting ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Submit"}
                         </button>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
