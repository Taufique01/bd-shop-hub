"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { addToCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";

interface Props {
  shopId: string;
  productId: string;
  shopSlug: string;
}

export function AddToCartButton({ shopId, productId, shopSlug }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addToCart(shopId, productId, 1);
      if (res?.success) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
        router.refresh();
      } else {
        alert(res?.error || "Failed to add to cart");
      }
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isPending || isSuccess}
      className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
        isSuccess
          ? "bg-green-500 text-white"
          : "gradient-brand text-white hover:opacity-90"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSuccess ? (
        <Check className="w-5 h-5" />
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
      {isPending ? "Adding..." : isSuccess ? "Added!" : "Add to Cart"}
    </button>
  );
}
