"use client";

import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  Folder,
  Grid2X2,
  Menu,
  LogOut,
  Settings,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { PlanoriaLogo } from "@/components/brand/planoria-logo";
import { authClient } from "@/lib/auth-client";

const styles = {
  avatar:
    "grid size-[30px] shrink-0 place-items-center rounded-full bg-[#e9eff5] text-[10px] font-bold text-[#142d4e]",
  brand:
    "flex h-[42px] items-center gap-[9px] px-[6px] text-[24px] leading-none font-extrabold text-[#142d4e] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] min-[1201px]:px-[10px] min-[1201px]:text-[26px] [font-family:var(--font-geist-sans),sans-serif] [&>svg]:shrink-0",
  brandDot: "text-[#059e79]",
  brandRow: "relative",
  mobileClose:
    "absolute top-px right-0 grid size-[38px] cursor-pointer place-items-center rounded-lg bg-transparent text-[#657387] hover:bg-[#f4f7f8] hover:text-[#142d4e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] md:hidden [&>svg]:size-5 [&>svg]:stroke-[1.8]",
  mobileTrigger:
    "fixed top-4 left-4 z-[45] grid size-[42px] cursor-pointer place-items-center rounded-[9px] border border-[#e1e7ec] bg-white text-[#142d4e] shadow-[0_7px_22px_rgb(20_45_78_/_10%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] md:hidden [&>svg]:size-5 [&>svg]:stroke-[1.8]",
  navigation: "grid gap-1.5",
  navigationItem:
    "flex min-h-[43px] w-full cursor-pointer items-center gap-3 rounded-[7px] bg-transparent px-[13px] py-3 text-left text-xs font-medium text-[#657387] transition-colors duration-150 hover:bg-[#f3f8f6] hover:text-[#23465e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] md:px-[11px] min-[1201px]:px-[13px] [&>svg]:size-[19px] [&>svg]:shrink-0 [&>svg]:stroke-[1.8]",
  navigationItemActive:
    "bg-[#eaf6f1] font-semibold text-[#078363] hover:bg-[#eaf6f1] hover:text-[#078363]",
  navigationLabel:
    "mx-3 mt-0 mb-[13px] text-[10px] leading-[1.3] font-bold tracking-[1.6px] text-[#52675f]",
  overlay:
    "fixed inset-0 z-50 border-0 bg-[#091a2c]/40 transition-opacity duration-200 md:hidden",
  planTask:
    "flex w-full cursor-pointer items-center justify-between rounded-[5px] bg-transparent py-0.5 text-left text-[10px] font-bold text-[#078363] hover:text-[#046b51] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] [&>svg]:size-3.5 [&>svg]:stroke-[1.8]",
  preferences:
    "mx-1.5 mt-[13px] mb-1.5 flex min-h-[37px] w-[calc(100%-12px)] cursor-pointer items-center gap-3 rounded-[7px] bg-transparent px-1.5 py-2 text-left text-xs text-[#657387] hover:bg-[#f5f7f8] hover:text-[#23465e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] [&>svg]:size-[19px] [&>svg]:stroke-[1.8]",
  presence: "size-1.5 shrink-0 rounded-full bg-[#059e79]",
  profile:
    "flex min-h-[77px] items-center gap-[9px] border-t border-[#e9edf1] px-[3px] py-[18px]",
  profileCopy: "min-w-0 flex-1 [&>small]:mt-1 [&>small]:block [&>small]:text-[10px] [&>small]:leading-[1.3] [&>small]:text-[#536477] [&>strong]:block [&>strong]:overflow-hidden [&>strong]:text-[11px] [&>strong]:font-bold [&>strong]:text-ellipsis [&>strong]:whitespace-nowrap [&>strong]:text-[#142d4e]",
  sidebar:
    "fixed inset-y-0 left-0 z-[60] flex h-dvh w-[min(88vw,260px)] flex-col overflow-x-hidden overflow-y-auto overscroll-contain border-r border-[#e9edf1] bg-white px-[14px] pt-[25px] text-[13px] text-[#142d4e] shadow-[15px_0_60px_rgb(20_45_78_/_18%)] transition-transform duration-200 [font-family:var(--font-geist-sans),sans-serif] [scrollbar-color:#d8e1e8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8e1e8] md:z-40 md:w-[205px] md:px-[14px] md:pt-[30px] md:shadow-none min-[1201px]:w-[232px] min-[1201px]:px-[19px]",
  sidebarBottom: "mt-auto pt-8 md:pt-10",
  sidebarTop: "shrink-0",
  taskCount:
    "ml-auto min-w-[22px] rounded bg-[#d5eee4] px-1.5 py-0.5 text-center text-[10px] leading-[1.3] font-medium text-[#657387]",
  tip:
    "rounded-[10px] border border-[#e5efeb] bg-[linear-gradient(145deg,#f0f8f5,#f6f8fa)] px-[13px] py-[18px] [&>h2]:m-0 [&>h2]:text-[11px] [&>h2]:leading-[1.3] [&>h2]:font-bold [&>h2]:text-[#142d4e] [&>p]:mt-2 [&>p]:mb-3 [&>p]:text-xs [&>p]:leading-[1.6] [&>p]:text-[#536477]",
  tipIcon: "mb-3 size-[22px] text-[#059e79] stroke-[1.8]",
  workspace:
    "my-[27px] mb-[30px] flex min-h-20 items-center gap-2 rounded-[9px] border border-[#e9edf1] px-2 py-[11px] min-[1201px]:gap-2.5 min-[1201px]:px-[9px]",
  workspaceChevron: "size-3.5 shrink-0 text-[#657387] stroke-[1.8]",
  workspaceCopy:
    "min-w-0 flex-1 leading-[1.2] [&>small]:mt-1 [&>small]:block [&>small]:text-xs [&>small]:leading-[1.6] [&>small]:text-[#536477] [&>strong]:block [&>strong]:overflow-hidden [&>strong]:text-[11px] [&>strong]:font-semibold [&>strong]:text-ellipsis [&>strong]:whitespace-nowrap [&>strong]:text-[#142d4e]",
  workspaceIcon:
    "grid h-8 w-7 shrink-0 place-items-center rounded-md bg-[#eaf4f0] text-base font-semibold text-[#059e79] min-[1201px]:w-[30px]",
} as const;

export type AdminSidebarItemId =
  | "dashboard"
  | "tasks"
  | "planning"
  | "projects"
  | "projets"
  | "collaborators"
  | "reports";

export type AdminSidebarProps = {
  activeItem?: AdminSidebarItemId;
  taskCount?: number;
  userName?: string;
  userInitials?: string;
  userRole?: string;
  onNavigate?: (item: AdminSidebarItemId) => void;
  onWorkspace?: () => void;
  onPlanTask?: () => void;
  onPreferences?: () => void;
  className?: string;
};

type NavigationItem = {
  id: AdminSidebarItemId;
  label: string;
  icon: LucideIcon;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: Grid2X2 },
  { id: "tasks", label: "Gestion des tâches", icon: CheckCircle2 },
  { id: "planning", label: "Planning", icon: CalendarDays },
  { id: "projets", label: "Projets", icon: Folder },
  { id: "collaborators", label: "Collaborateurs", icon: Users },
  { id: "reports", label: "Rapports", icon: ChartNoAxesCombined },
];

const MOBILE_QUERY = "(max-width: 767px)";

export function AdminSidebar({
  activeItem = "dashboard",
  taskCount = 18,
  userName = "Tchamabe D.",
  userInitials = "TD",
  userRole = "Administrateur",
  onNavigate,
  onWorkspace,
  onPlanTask,
  onPreferences,
  className,
}: AdminSidebarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user as ({ name: string; role?: string } | undefined);
  const displayedName = sessionUser?.name || userName;
  const displayedInitials = sessionUser?.name ? sessionUser.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") : userInitials;
  const displayedRole = sessionUser?.role === "administrator" ? "Administrateur" : userRole;
  const sidebarId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateViewport = () => {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) setMobileOpen(false);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      wasOpenRef.current = false;
      return;
    }

    if (mobileOpen) {
      wasOpenRef.current = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

      return () => {
        window.cancelAnimationFrame(frame);
        document.body.style.overflow = previousOverflow;
      };
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      const frame = window.requestAnimationFrame(() => triggerRef.current?.focus());
      return () => window.cancelAnimationFrame(frame);
    }
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const handleSidebarKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isMobile || !mobileOpen || event.key !== "Tab") return;

    const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleNavigation = (item: AdminSidebarItemId) => {
    const routes: Partial<Record<AdminSidebarItemId, string>> = {
      dashboard: "/",
      tasks: "/taches",
      planning: "/planning",
      projects: "/projets",
      projets: "/projets",
      collaborators: "/collaborateurs",
      reports: "/rapports",
    };
    const route = routes[item];
    if (route) router.push(route);
    else onNavigate?.(item);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.mobileTrigger}
        aria-label="Ouvrir le menu administrateur"
        aria-controls={sidebarId}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <Menu aria-hidden="true" />
      </button>

      <button
        type="button"
        className={`${styles.overlay} ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-label="Fermer le menu administrateur"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        ref={sidebarRef}
        id={sidebarId}
        className={`${styles.sidebar} ${mobileOpen ? "translate-x-0" : "-translate-x-[105%] md:translate-x-0"} ${className ?? ""}`}
        aria-label="Navigation administrateur"
        aria-hidden={isMobile && !mobileOpen ? true : undefined}
        aria-modal={isMobile && mobileOpen ? true : undefined}
        role={isMobile ? "dialog" : "complementary"}
        inert={isMobile && !mobileOpen ? true : undefined}
        onKeyDown={handleSidebarKeyDown}
      >
        <div className={styles.sidebarTop}>
          <div className={styles.brandRow}>
            <Link className={styles.brand} href="/" aria-label="Planoria, accueil">
              <PlanoriaLogo size={38} title="Logo Planoria" />
              <span>
                Planoria<span className={styles.brandDot}>.</span>
              </span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              className={styles.mobileClose}
              aria-label="Fermer le menu administrateur"
              onClick={() => setMobileOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className={`${styles.workspace} w-full text-left transition-colors hover:bg-[#f6f9f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]`}
            onClick={onWorkspace}
          >
            <span className={styles.workspaceIcon} aria-hidden="true">S</span>
            <span className={styles.workspaceCopy}>
              <strong>Success Workspace</strong>
              <small>Espace administrateur</small>
            </span>
            <ChevronDown className={styles.workspaceChevron} aria-hidden="true" />
          </button>

          <p className={styles.navigationLabel}>ESPACE DE TRAVAIL</p>
          <nav className={styles.navigation} aria-label="Espace de travail">
            {NAVIGATION_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeItem === id || (activeItem === "projects" && id === "projets");
              return (
                <button
                  key={id}
                  type="button"
                  className={`${styles.navigationItem} ${active ? styles.navigationItemActive : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => handleNavigation(id)}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  {id === "tasks" && taskCount >= 0 ? (
                    <span className={styles.taskCount} aria-label={`${taskCount} tâches`}>
                      {taskCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <section className={styles.tip} aria-labelledby={`${sidebarId}-tip-title`}>
            <Sparkles className={styles.tipIcon} aria-hidden="true" />
            <h2 id={`${sidebarId}-tip-title`}>Un cap clair, chaque jour.</h2>
            <p>Transformez vos objectifs en actions concrètes.</p>
            <button type="button" className={styles.planTask} onClick={onPlanTask}>
              <span>Planifier une tâche</span>
              <ArrowUpRight aria-hidden="true" />
            </button>
          </section>

          <button type="button" className={styles.preferences} onClick={onPreferences}>
            <Settings aria-hidden="true" />
            <span>Préférences</span>
          </button>

          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">{displayedInitials}</span>
            <span className={styles.profileCopy}>
              <strong>{displayedName}</strong>
              <small>{displayedRole}</small>
            </span>
            <span className={styles.presence} aria-label="En ligne" role="status" />
            <button type="button" aria-label="Se déconnecter" className="grid size-8 shrink-0 place-items-center rounded-lg text-[#657387] hover:bg-[#f4f7f8] hover:text-[#142d4e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]" onClick={async () => { await authClient.signOut(); router.replace("/connexion"); router.refresh(); }}><LogOut className="size-4" aria-hidden="true" /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
