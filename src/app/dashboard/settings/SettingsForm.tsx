"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateShopSettings } from "@/app/actions/shop";

type FormData = {
  name: string;
  shortDescription: string;
  fullAbout: string;
  categoryId: string;
  subcategory: string;
  logoUrl: string;
  coverUrl: string;
  address: string;
  city: string;
  businessPhone: string;
  whatsappNumber: string;
  messengerLink: string;
  websiteUrl: string;
  facebookPageUrl: string;
  facebookUsername: string;
  isOpen: boolean;
};

export default function SettingsForm({ shop, categories }: { shop: any, categories: any[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: shop.name || "",
      shortDescription: shop.shortDescription || "",
      fullAbout: shop.fullAbout || "",
      categoryId: shop.categoryId || "",
      subcategory: shop.subcategory || "",
      logoUrl: shop.logoUrl || "",
      coverUrl: shop.coverUrl || "",
      address: shop.address || "",
      city: shop.city || "",
      businessPhone: shop.businessPhone || "",
      whatsappNumber: shop.whatsappNumber || "",
      messengerLink: shop.messengerLink || "",
      websiteUrl: shop.websiteUrl || "",
      facebookPageUrl: shop.facebookPageUrl || "",
      facebookUsername: shop.facebookUsername || "",
      isOpen: shop.isOpen ?? true,
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const res = await updateShopSettings(data);
      if (res.success) {
        toast.success("Settings updated successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update settings");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Shop Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="Your shop name"
            />
            {errors.name && <span className="text-xs text-red-500">Name is required</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">City</label>
            <input
              {...register("city")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="e.g. Dhaka"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Short Description</label>
            <input
              {...register("shortDescription")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="A brief tagline or summary"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Full About Text</label>
            <textarea
              {...register("fullAbout")}
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none resize-none"
              placeholder="Detailed description of your shop, your products, and what makes you unique."
            />
          </div>
        </div>
      </div>

      {/* Categorization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Categorization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <select
              {...register("categoryId")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Subcategory</label>
            <input
              {...register("subcategory")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="e.g. T-Shirts"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Branding Images</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Logo URL</label>
            <input
              {...register("logoUrl")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Cover URL</label>
            <input
              {...register("coverUrl")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="https://example.com/cover.png"
            />
          </div>
        </div>
      </div>

      {/* Contact & Social Links */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Contact & Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Full Address</label>
            <input
              {...register("address")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="Your physical store address (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Business Phone</label>
            <input
              {...register("businessPhone")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="+8801..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">WhatsApp Number</label>
            <input
              {...register("whatsappNumber")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="+8801..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Messenger Link</label>
            <input
              {...register("messengerLink")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="m.me/yourpage"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Website URL</label>
            <input
              {...register("websiteUrl")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Facebook Page URL</label>
            <input
              {...register("facebookPageUrl")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Facebook Username</label>
            <input
              {...register("facebookUsername")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm outline-none"
              placeholder="@yourpage"
            />
          </div>
        </div>
      </div>

      {/* Shop Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Shop Open Status</h2>
          <p className="text-sm text-slate-500 mt-1">Turn off if you are temporarily closed or on vacation.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" {...register("isOpen")} className="sr-only peer" />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
