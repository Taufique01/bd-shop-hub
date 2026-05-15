"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

type Step = "profile" | "shop" | "complete";
const role: "SELLER" = "SELLER";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    city: "",
  });

  const [shopData, setShopData] = useState({
    shopName: "",
    shopSlug: "",
    shortDescription: "",
  });

  useEffect(() => {
    if (isLoaded && user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.fullName ?? user.firstName ?? "",
      }));
    }
  }, [isLoaded, user]);

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          ...profileData,
          ...(role === "SELLER" ? shopData : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Onboarding failed");
      }

      setStep("complete");
      setTimeout(() => {
        router.push(role === "SELLER" ? "/dashboard" : "/shops");
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-elevated flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(
            [
              "role",
              "profile",
              ...(role === "SELLER" ? ["shop"] : []),
              "complete",
            ] as Step[]
          ).map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step === s
                    ? "gradient-brand text-white scale-110"
                    : arr.indexOf(step) > arr.indexOf(s)
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {arr.indexOf(step) > arr.indexOf(s) ? "✓" : i + 1}
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full gradient-brand transition-all duration-500"
                    style={{
                      width: arr.indexOf(step) > arr.indexOf(s) ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Step: Profile */}
          {step === "profile" && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Your Profile
              </h2>
              <p className="text-slate-500 mb-8">
                Tell us a bit about yourself
              </p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="+880 1xxx-xxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    City
                  </label>
                  <select
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({ ...profileData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-slate-900"
                  >
                    <option value="">Select city</option>
                    {[
                      "Dhaka",
                      "Chittagong",
                      "Sylhet",
                      "Rajshahi",
                      "Khulna",
                      "Barishal",
                      "Mymensingh",
                      "Rangpur",
                    ].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() =>
                    role === "SELLER" ? setStep("shop") : handleComplete()
                  }
                  disabled={!profileData.name || loading}
                  className="flex-1 py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {role === "SELLER"
                    ? "Continue →"
                    : loading
                      ? "Setting up..."
                      : "Complete →"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Shop (seller only) */}
          {step === "shop" && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Create Your Shop
              </h2>
              <p className="text-slate-500 mb-8">Set up your seller profile</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={shopData.shopName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/[\s_-]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      setShopData({
                        ...shopData,
                        shopName: name,
                        shopSlug: slug,
                      });
                    }}
                    placeholder="My Awesome Shop"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Shop URL (slug)
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all overflow-hidden">
                    <span className="px-3 py-3 bg-slate-50 text-slate-500 text-sm border-r border-slate-200">
                      hozoborolo.com/shops/
                    </span>
                    <input
                      type="text"
                      value={shopData.shopSlug}
                      onChange={(e) =>
                        setShopData({ ...shopData, shopSlug: e.target.value })
                      }
                      className="flex-1 px-3 py-3 focus:outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Short Description
                  </label>
                  <textarea
                    value={shopData.shortDescription}
                    onChange={(e) =>
                      setShopData({
                        ...shopData,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="What does your shop sell?"
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-slate-900 resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">
                    {shopData.shortDescription.length}/200
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("profile")}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!shopData.shopName || !shopData.shopSlug || loading}
                  className="flex-1 py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Creating shop..." : "Launch Shop 🚀"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === "complete" && (
            <div className="animate-fade-in-up text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                You're all set!
              </h2>
              <p className="text-slate-500">
                {role === "SELLER"
                  ? "Your shop is created. Redirecting to your dashboard..."
                  : "Welcome aboard! Redirecting to the shop directory..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
