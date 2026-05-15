"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Package,
  Tag,
  Globe,
  Loader2,
  X,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import Link from "next/link";

// Local schema specifically for the form (coerce types for RHF compatibility)
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  sku: z.string().max(100).optional(),
  price: z.number().min(0.01, "Price is required"),
  salePrice: z.number().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  inStock: z.boolean(),
  mainImageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  isFeatured: z.boolean(),
  orderableInternally: z.boolean(),
  externalInquiryOnly: z.boolean(),
  whatsappInquiryTemplate: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(155).optional(),
});

type ProductFormData = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface Props {
  initialData?: Partial<ProductFormData> & { id?: string; slug?: string };
  categories: Category[];
  shopSlug: string;
  mode: "create" | "edit";
}

export function ProductForm({
  initialData,
  categories,
  shopSlug,
  mode,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "inventory" | "seo" | "settings"
  >("basic");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      longDescription: initialData?.longDescription ?? "",
      sku: initialData?.sku ?? "",
      price: initialData?.price ?? 0,
      salePrice: initialData?.salePrice ?? null,
      stockQuantity: initialData?.stockQuantity ?? 0,
      inStock: initialData?.inStock ?? true,
      mainImageUrl: initialData?.mainImageUrl ?? "",
      categoryId: initialData?.categoryId ?? "",
      tags: initialData?.tags ?? "",
      status: (initialData?.status as "DRAFT" | "PUBLISHED") ?? "DRAFT",
      isFeatured: initialData?.isFeatured ?? false,
      orderableInternally: initialData?.orderableInternally ?? true,
      externalInquiryOnly: initialData?.externalInquiryOnly ?? false,
      whatsappInquiryTemplate: initialData?.whatsappInquiryTemplate ?? "",
      metaTitle: initialData?.metaTitle ?? "",
      metaDescription: initialData?.metaDescription ?? "",
    },
  });

  const watchedStatus = watch("status");
  const watchedMainImageUrl = watch("mainImageUrl");

  const onSubmit = (data: ProductFormData) => {
    console.log("submitted-->lkjkjjk");
    startTransition(async () => {
      setError(null);
      try {
        const url =
          mode === "create"
            ? "/api/products"
            : `/api/products/${initialData?.id}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const payload = {
          ...data,
          tags: data.tags
            ? data.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          salePrice: data.salePrice || null,
        };

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Request failed");

        setSuccess(true);
        router.push("/dashboard/products");
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "inventory", label: "Inventory & Pricing" },
    { id: "settings", label: "Settings" },
    { id: "seo", label: "SEO" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === "create" ? "Add Product" : "Edit Product"}
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {mode === "create"
              ? "Create a new product for your shop"
              : `Editing: ${initialData?.title}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {initialData?.slug && (
            <Link
              href={`/store/${shopSlug}/p/${initialData.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> Preview
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <X className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(
          (data) => {
            console.log("valid submit", data);
            onSubmit(data);
          },
          (errors) => {
            console.log("form errors", errors);
          },
        )}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Product Title *
                </label>
                <input
                  {...register("title")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                  placeholder="e.g. Premium Cotton T-Shirt"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Short Description
                </label>
                <textarea
                  {...register("shortDescription")}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors resize-none"
                  placeholder="Brief description shown on cards and listings..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Description
                </label>
                <textarea
                  {...register("longDescription")}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors resize-none"
                  placeholder="Detailed product description, features, materials, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors bg-white"
                >
                  <option value="">Select category (optional)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tags
                </label>
                <input
                  {...register("tags")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                  placeholder="cotton, summer, casual (comma-separated)"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
          )}

          {/* Inventory & Pricing Tab */}
          {activeTab === "inventory" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Price (৳) *
                  </label>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Sale Price (৳)
                  </label>
                  <input
                    {...register("salePrice", {
                      setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                    placeholder="Leave empty if no sale"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    SKU
                  </label>
                  <input
                    {...register("sku")}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                    placeholder="e.g. TSHIRT-RED-L"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    {...register("stockQuantity", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    In Stock
                  </p>
                  <p className="text-xs text-slate-400">
                    Toggle product availability
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    {...register("inStock")}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-500 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform"></div>
                </label>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Featured Product
                  </p>
                  <p className="text-xs text-slate-400">
                    Shows at top of your shop and homepage
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    {...register("isFeatured")}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-500 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Orderable Internally
                  </p>
                  <p className="text-xs text-slate-400">
                    Allow buyers to place orders through our platform
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    {...register("orderableInternally")}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-500 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    External Inquiry Only
                  </p>
                  <p className="text-xs text-slate-400">
                    Redirect buyers to WhatsApp/Messenger instead of checkout
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    {...register("externalInquiryOnly")}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-500 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  WhatsApp Inquiry Template
                </label>
                <textarea
                  {...register("whatsappInquiryTemplate")}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors resize-none"
                  placeholder="Hi, I'm interested in your {product_name}. Can you tell me more?"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Use {"{product_name}"} as a placeholder
                </p>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  SEO Title
                </label>
                <input
                  {...register("metaTitle")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
                  placeholder="SEO-optimized title (max 70 chars)"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {watch("metaTitle")?.length ?? 0}/70 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  SEO Description
                </label>
                <textarea
                  {...register("metaDescription")}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors resize-none"
                  placeholder="Meta description for search engines (max 155 chars)"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {watch("metaDescription")?.length ?? 0}/155 characters
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Publish</h3>
            <div className="space-y-3">
              {(["DRAFT", "PUBLISHED"] as const).map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                    watchedStatus === s
                      ? "border-brand-400 bg-brand-50"
                      : "border-transparent bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    value={s}
                    {...register("status")}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      watchedStatus === s
                        ? "border-brand-500 bg-brand-500"
                        : "border-slate-300"
                    }`}
                  >
                    {watchedStatus === s && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s}</p>
                    <p className="text-xs text-slate-400">
                      {s === "DRAFT"
                        ? "Not visible to buyers"
                        : "Live in your shop"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />{" "}
                  {mode === "create" ? "Create Product" : "Save Changes"}
                </>
              )}
            </button>
          </div>

          {/* Main Image */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Main Image</h3>
            {watchedMainImageUrl ? (
              <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 mb-3">
                <img
                  src={watchedMainImageUrl}
                  alt="Product"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setValue("mainImageUrl", "")}
                  className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No image set</p>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Image URL
              </label>
              <input
                {...register("mainImageUrl")}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-xs transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              {errors.mainImageUrl && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.mainImageUrl.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
