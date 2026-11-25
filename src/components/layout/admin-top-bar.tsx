"use client";

import { Bell, ExternalLink } from "lucide-react";

export type AdminTopBarProps = {
  currentPage: string;
  notificationCount: number;
  onNotifications: () => void;
  onCollaborator: () => void;
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]";

export function AdminTopBar({ currentPage, notificationCount, onNotifications, onCollaborator }: AdminTopBarProps) {
  return (
    <div className="flex min-h-[76px] items-center border-b border-[#e6eaed] bg-white px-5 sm:px-8">
      <p className="hidden text-[11px] text-[#667486] sm:block">
        Espace de travail <span className="mx-3">/</span>{" "}
        <strong className="font-medium text-[#334b61]">{currentPage}</strong>
      </p>
      <div className="ml-auto flex items-center gap-4">
        <button type="button" onClick={onCollaborator} className={`hidden items-center gap-2 rounded-lg border border-[#dcebe5] bg-[#f2f8f5] px-3 py-2 text-[10px] font-semibold text-[#078363] sm:flex ${focus}`}>
          Espace collaborateur <ExternalLink className="size-3" aria-hidden="true" />
        </button>
        <span className="hidden items-center gap-2 text-[10px] text-[#667486] sm:flex"><span className="size-1.5 rounded-full bg-[#18be8e]" />Espace démo</span>
        <button type="button" aria-label={`Notifications, ${notificationCount} éléments requièrent votre attention`} onClick={onNotifications} className={`relative grid size-9 place-items-center rounded-lg hover:bg-[#f3f6f7] ${focus}`}>
          <Bell className="size-[18px] stroke-[1.7]" aria-hidden="true" />
          {notificationCount ? <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[#e57461]" /> : null}
        </button>
        <span className="grid size-8 place-items-center rounded-full bg-[#eef2f6] text-[10px] font-bold">TD</span>
      </div>
    </div>
  );
}
