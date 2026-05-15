"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, Loader2, Package } from "lucide-react";
import { updateCartItemQuantity, removeFromCart } from "@/app/actions/cart";

interface Props {
  cartItems: any[];
  shopSlug: string;
}

export function CartItemsList({ cartItems, shopSlug }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (cartItemId: string, quantity: number) => {
    startTransition(async () => {
      await updateCartItemQuantity(cartItemId, quantity);
    });
  };

  const handleRemove = (cartItemId: string) => {
    startTransition(async () => {
      await removeFromCart(cartItemId);
    });
  };

  return (
    <ul className="space-y-4">
      {cartItems.map((item) => (
        <li
          key={item.id}
          className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 transition-all hover:border-brand-200"
        >
          {/* Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 relative">
            {item.product.mainImageUrl ? (
              <img
                src={item.product.mainImageUrl}
                alt={item.product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="absolute inset-0 m-auto w-6 h-6 text-slate-300" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/store/${shopSlug}/p/${item.product.slug}`}
              className="font-semibold text-slate-800 hover:text-brand-600 truncate block"
            >
              {item.product.title}
            </Link>
            <div className="text-brand-600 font-bold mt-1">
              ৳{Number(item.product.salePrice ?? item.product.price).toLocaleString()}
            </div>
            {item.product.salePrice && (
              <div className="hidden">
                 {/* Empty space for alignment/hidden UI elements if desired */}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                disabled={isPending || item.quantity <= 1}
                onClick={() => handleUpdate(item.id, item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                disabled={isPending || item.quantity >= (item.product.stockQuantity || 999)}
                onClick={() => handleUpdate(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            <button
              disabled={isPending}
              onClick={() => handleRemove(item.id)}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
