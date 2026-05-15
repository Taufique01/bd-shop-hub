"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { User, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

export function UserMenu() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded || !isSignedIn || !user) {
    return null;
  }

  const fullName = user.fullName || "User";
  const email = user.primaryEmailAddress?.emailAddress;
  const imageUrl = user.imageUrl;
  const initials = getInitials(fullName);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="group flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-slate-100 focus:outline-none">
          <Avatar.Root className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200">
            <Avatar.Image
              src={imageUrl}
              alt={fullName}
              className="h-full w-full object-cover"
            />
            <Avatar.Fallback className="flex h-full w-full items-center justify-center bg-brand-50 text-[10px] font-bold text-brand-700">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="flex items-center gap-1.5">
            <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700">
              {fullName}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all animate-fade-in-up"
          sideOffset={8}
          align="end"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar.Root className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-100">
              <Avatar.Image
                src={imageUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
              <Avatar.Fallback className="flex h-full w-full items-center justify-center bg-brand-50 text-xs font-bold text-brand-700">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-bold text-slate-900">
                {fullName}
              </span>
              {email && (
                <span className="truncate text-xs text-slate-500">{email}</span>
              )}
            </div>
          </div>

          <div className="my-1.5 h-px bg-slate-100" />

          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Profile</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/help"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span>Help</span>
            </Link>
          </DropdownMenu.Item>

          <div className="my-1.5 h-px bg-slate-100" />

          <DropdownMenu.Item
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none transition-colors hover:bg-red-50 focus:bg-red-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
