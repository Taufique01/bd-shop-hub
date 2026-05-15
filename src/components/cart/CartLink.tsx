import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface Props {
  shopSlug: string;
  itemCount: number;
}

export function CartLink({ shopSlug, itemCount }: Props) {
  return (
    <Link
      href={`/store/${shopSlug}/cart`}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
    >
      <ShoppingCart className="w-5 h-5 text-slate-700" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
