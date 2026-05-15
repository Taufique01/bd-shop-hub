"use client";

import { useState } from "react";
import { Star, MessageSquare, Check, X, ShieldAlert, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { replyToReview, updateReviewStatus } from "@/app/actions/reviews";

type TabType = "shop" | "product";

export default function ReviewClientManager({ shopReviews, productReviews }: { shopReviews: any[]; productReviews: any[] }) {
  const [activeTab, setActiveTab] = useState<TabType>("shop");

  const displayList = activeTab === "shop" ? shopReviews : productReviews;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-100 p-2 gap-2">
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "shop"
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Shop Reviews
        </button>
        <button
          onClick={() => setActiveTab("product")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "product"
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Product Reviews
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {displayList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
            <p>No {activeTab} reviews found yet.</p>
          </div>
        ) : (
          displayList.map((review) => (
            <ReviewItem key={review.id} review={review} type={activeTab} />
          ))
        )}
      </div>
    </div>
  );
}

function ReviewItem({ review, type }: { review: any; type: TabType }) {
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function handleReply() {
    if (!replyBody.trim()) return;
    setSubmittingReply(true);
    const res = await replyToReview(review.id, type, replyBody);
    setSubmittingReply(false);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Reply posted successfully");
      setReplying(false);
      setReplyBody("");
    }
  }

  async function handleStatusChange(status: "APPROVED" | "REJECTED" | "HIDDEN") {
    setUpdatingStatus(true);
    const res = await updateReviewStatus(review.id, type, status);
    setUpdatingStatus(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Review status updated to ${status}`);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? "fill-amber-400" : "fill-slate-100 text-slate-200"}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-800">{review.rating} / 5</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(review.createdAt))} ago</span>
            {review.status !== "APPROVED" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                {review.status}
              </span>
            )}
          </div>
          
          <p className="font-semibold text-slate-900">{review.user.name}</p>
          {review.title && <p className="text-sm font-semibold text-slate-800 mt-1">{review.title}</p>}
          {review.body && <p className="text-sm text-slate-600 mt-1 mt-2">{review.body}</p>}
          {review.isVerifiedPurchase && (
             <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-lg font-semibold mt-2 border border-green-200 uppercase">
                 <Check className="w-3 h-3" />
                 Verified Purchase
             </span>
          )}

          {/* Product Info (if product review) */}
          {type === "product" && review.product && (
            <div className="mt-3 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs text-slate-600 border border-slate-100">
               <LinkIcon className="w-4 h-4 text-slate-400" />
               <span className="font-medium text-slate-900 truncate max-w-[200px]">{review.product.title}</span>
            </div>
          )}

          {/* Existing Reply */}
          {review.reply && (
            <div className="mt-4 bg-brand-50 rounded-xl p-4 border border-brand-100 ml-4 relative">
              <div className="absolute top-4 -left-2 w-4 h-4 bg-brand-50 border-t border-l border-brand-100 transform -rotate-45" />
              <p className="text-xs font-bold text-brand-700 mb-1">Your Reply</p>
              <p className="text-sm text-slate-700">{review.reply.body}</p>
            </div>
          )}

          {/* Reply Action */}
          {!review.reply && !replying && (
             <button
               disabled={updatingStatus}
               onClick={() => setReplying(true)}
               className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
             >
               <MessageSquare className="w-4 h-4" />
               Reply to customer
             </button>
          )}

          {/* Reply Form */}
          {replying && (
            <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 ml-4">
              <p className="text-xs font-bold text-slate-800 mb-2">Write a public reply</p>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={3}
                placeholder="Thank the customer for their review..."
                className="w-full text-sm rounded-lg border-slate-200 border p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={!replyBody.trim() || submittingReply}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-brand-700 transition-colors"
                >
                  {submittingReply ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Post Reply"}
                </button>
                <button
                  onClick={() => { setReplying(false); setReplyBody(""); }}
                  disabled={submittingReply}
                  className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Actions Menu */}
        <div className="flex flex-col gap-2">
          {review.status === "APPROVED" ? (
             <button 
               onClick={() => handleStatusChange("HIDDEN")}
               disabled={updatingStatus}
               className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors tooltip"
               title="Hide Review"
             >
               {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
             </button>
          ) : (
             <button
               onClick={() => handleStatusChange("APPROVED")}
               disabled={updatingStatus} 
               className="p-2 border border-slate-200 rounded-lg text-green-600 hover:bg-green-50 transition-colors tooltip"
               title="Approve Review"
             >
               {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
