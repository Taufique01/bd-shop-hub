"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { checkoutSchema } from "@/lib/validations";
import { processCheckout } from "@/app/actions/checkout";
import { Loader2, AlertCircle } from "lucide-react";
import * as z from "zod";

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface Props {
  shopId: string;
  shopSlug: string;
}

export function CheckoutFormClient({ shopId, shopSlug }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shopId,
      shippingAddress: {
        country: "Bangladesh",
      },
      paymentMethod: "CASH_ON_DELIVERY",
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    startTransition(async () => {
      const result = await processCheckout(data, shopId);
      if (result.success) {
        // Redirect to success page
        router.push(`/store/${shopSlug}/checkout/success?order=${result.orderNumber}`);
      } else {
        setError("root", { message: result.error || "Failed to process checkout" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8 space-y-8">
        {errors.root && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.root.message}
          </div>
        )}

        {/* Shipping Address */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                {...register("shippingAddress.fullName")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                placeholder="John Doe"
              />
              {errors.shippingAddress?.fullName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.shippingAddress.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                {...register("shippingAddress.phone")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                placeholder="+88017xxxxxxxx"
              />
              {errors.shippingAddress?.phone && (
                <p className="text-red-500 text-xs mt-1.5">{errors.shippingAddress.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
              <input
                {...register("shippingAddress.city")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                placeholder="Dhaka"
              />
              {errors.shippingAddress?.city && (
                <p className="text-red-500 text-xs mt-1.5">{errors.shippingAddress.city.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address Line 1</label>
              <input
                {...register("shippingAddress.addressLine1")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                placeholder="House, Road, Area"
              />
              {errors.shippingAddress?.addressLine1 && (
                <p className="text-red-500 text-xs mt-1.5">{errors.shippingAddress.addressLine1.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address Line 2 (Optional)</label>
              <input
                {...register("shippingAddress.addressLine2")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">District (Optional)</label>
              <input
                {...register("shippingAddress.district")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Postal Code (Optional)</label>
              <input
                {...register("shippingAddress.postalCode")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Payment Method */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Payment Method</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-brand-200 bg-brand-50 rounded-xl cursor-pointer">
              <input
                type="radio"
                value="CASH_ON_DELIVERY"
                {...register("paymentMethod")}
                className="w-5 h-5 text-brand-600 focus:ring-brand-500 border-brand-300"
              />
              <span className="font-semibold text-brand-900">Cash on Delivery</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer opacity-50">
              <input
                type="radio"
                value="MOBILE_BANKING"
                disabled
                className="w-5 h-5"
              />
              <span className="font-semibold text-slate-500">Mobile Banking (Coming Soon)</span>
            </label>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Notes */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Additional Notes</h2>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors resize-none"
            placeholder="Special instructions for delivery..."
          />
        </div>
      </div>

      <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 gradient-brand text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </form>
  );
}
