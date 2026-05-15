"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Palette, Check, Eye, Loader2, ExternalLink, Store } from "lucide-react";
import Link from "next/link";

interface Theme {
  value: "MODERN_CLEAN" | "COLORFUL_SOCIAL" | "MINIMAL_BOUTIQUE";
  label: string;
  description: string;
  preview: string;
  colors: string[];
}

const THEMES: Theme[] = [
  {
    value: "MODERN_CLEAN",
    label: "Modern Clean",
    description: "Professional white-space design with clean typography. Perfect for any product type.",
    preview: "bg-gradient-to-br from-white to-slate-100",
    colors: ["#3b6ef6", "#6d28d9", "#f8fafc"],
  },
  {
    value: "COLORFUL_SOCIAL",
    label: "Colorful Social Commerce",
    description: "Vibrant, bold design inspired by social media. Great for fashion and lifestyle products.",
    preview: "bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500",
    colors: ["#f97316", "#ec4899", "#a855f7"],
  },
  {
    value: "MINIMAL_BOUTIQUE",
    label: "Minimal Boutique",
    description: "Elegant, editorial style with serif fonts. Perfect for luxury and handcrafted goods.",
    preview: "bg-gradient-to-br from-stone-200 to-stone-100",
    colors: ["#292524", "#78716c", "#fafaf9"],
  },
];

interface Props {
  currentTheme: string;
  shopSlug: string;
  internalShopEnabled: boolean;
  storefrontEnabled: boolean;
}

export function ThemeSettingsClient({ currentTheme, shopSlug, internalShopEnabled, storefrontEnabled }: Props) {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launching, startLaunching] = useTransition();

  const handleSave = () => {
    startSaving(async () => {
      setError(null);
      setSaved(false);
      try {
        const res = await fetch("/api/shops/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activeTheme: selectedTheme }),
        });
        if (!res.ok) throw new Error("Failed to save theme");
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const handleLaunchStorefront = () => {
    startLaunching(async () => {
      try {
        const res = await fetch("/api/shops/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storefrontEnabled: true, internalShopEnabled: true }),
        });
        if (!res.ok) throw new Error("Failed to launch storefront");
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Storefront & Theme</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Launch your premium mini website and choose your style
          </p>
        </div>
      </div>

      {/* Launch Storefront Banner */}
      {!storefrontEnabled && (
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-brand-500/20 transition-all duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Launch your mini website</h2>
              <ul className="text-slate-400 text-sm space-y-1 mb-0">
                 <li className="flex items-center gap-2">✅ Beautiful premium themes</li>
                 <li className="flex items-center gap-2">✅ Full cart & automated checkout</li>
                 <li className="flex items-center gap-2">✅ Custom storefront URL</li>
              </ul>
            </div>
            <button
              onClick={handleLaunchStorefront}
              disabled={launching}
              className="px-8 py-4 bg-brand-500 text-white rounded-2xl font-black hover:bg-brand-600 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {launching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Store className="w-5 h-5" />}
              Launch Paid Storefront
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Link */}
      {storefrontEnabled && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
             <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
             <p className="text-sm text-green-900 font-bold">Your Storefront is LIVE!</p>
             <p className="text-xs text-green-600">Customers can now buy directly from your mini-website.</p>
          </div>
          <Link
            href={`/store/${shopSlug}`}
            target="_blank"
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors"
          >
            <Eye className="w-4 h-4" /> View Store
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Theme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.value;

          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => setSelectedTheme(theme.value)}
              className={`text-left border-2 rounded-2xl overflow-hidden transition-all hover:shadow-lg ${
                isSelected
                  ? "border-brand-400 shadow-lg shadow-brand-100"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              {/* Theme preview */}
              <div className={`h-36 ${theme.preview} relative`}>
                {/* Simulated UI elements */}
                <div className="absolute inset-0 flex flex-col p-3 gap-2">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg h-7 flex items-center px-3 gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/60" />
                    <div className="flex-1 h-2 bg-white/40 rounded-full" />
                  </div>
                  <div className="flex gap-2 flex-1">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg flex-1" />
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg flex-1" />
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg flex-1" />
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  {/* Color swatches */}
                  <div className="flex gap-1">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{theme.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{theme.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || selectedTheme === currentTheme}
          className="flex items-center gap-2 px-6 py-2.5 gradient-brand text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" /> Saved!
            </>
          ) : (
            "Save Theme"
          )}
        </button>
        {selectedTheme !== currentTheme && (
          <p className="text-sm text-slate-500">
            You&#39;ve selected <strong>{THEMES.find((t) => t.value === selectedTheme)?.label}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
