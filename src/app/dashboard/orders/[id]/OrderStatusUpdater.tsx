"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/orders";
import { Loader2, CheckCircle } from "lucide-react";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleUpdate = () => {
    if (status === currentStatus) return;
    
    startTransition(async () => {
       const res = await updateOrderStatus(orderId, status);
       if (res.success) {
         setSuccessMsg(true);
         setTimeout(() => setSuccessMsg(false), 2000);
       } else {
         alert(res.error || "Failed to update status");
       }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Update Status:</label>
      <select
        disabled={isPending}
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="form-select w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      
      <button
        onClick={handleUpdate}
        disabled={isPending || status === currentStatus}
        className="w-full sm:w-auto px-5 py-2 gradient-brand text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : successMsg ? <CheckCircle className="w-4 h-4" /> : "Save"}
        {successMsg ? "Saved!" : "Update"}
      </button>
    </div>
  );
}
