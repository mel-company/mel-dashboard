import {
  Package,
  List,
  Percent,
  ShoppingCart,
  Users,
  Users2,
  Settings,
  Search,
  BarChart2,
  Calculator,
  AppWindow,
  Keyboard,
  Store,
  Globe,
  CreditCard,
  Truck,
  FileText,
  Bell,
  MessageCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useEffect, useMemo, useRef, useState } from "react";
import Mousetrap from "mousetrap";
import { useLocation, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AppItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description?: string;
  badge?: string;
  emojiIcon?: string;
  subItems?: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

type SearchableItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description?: string;
  badge?: string;
};

const baseApps: AppItem[] = [
  {
    label: "الاحصائيات",
    path: "/stats",
    icon: BarChart2,
    gradient: "from-blue-500 to-blue-600",
    description: "إحصائيات وأداء المتجر",
  },
  {
    label: "المنتجات",
    path: "/products",
    icon: Package,
    gradient: "from-emerald-500 to-emerald-600",
    description: "إدارة المنتجات",
    badge: "جديد",
  },
  {
    label: "الفئات",
    path: "/categories",
    icon: List,
    gradient: "from-violet-500 to-violet-600",
    description: "إدارة الفئات",
  },
  {
    label: "الخصومات",
    path: "/discounts",
    icon: Percent,
    gradient: "from-rose-500 to-rose-600",
    description: "إدارة الخصومات",
    badge: "عروض",
  },
  {
    label: "الطلبات",
    path: "/orders",
    icon: ShoppingCart,
    gradient: "from-orange-500 to-orange-600",
    description: "إدارة الطلبات",
  },
  {
    label: "العملاء",
    path: "/customers",
    icon: Users,
    gradient: "from-cyan-500 to-cyan-600",
    description: "إدارة العملاء",
  },
  {
    label: "الموظفين",
    path: "/employees",
    icon: Users2,
    gradient: "from-indigo-500 to-indigo-600",
    description: "إدارة الموظفين",
  },
  {
    label: "الإعدادات",
    path: "/settings",
    icon: Settings,
    gradient: "from-slate-500 to-slate-600",
    description: "إعدادات النظام",
    subItems: [
      {
        label: "عامة",
        path: "/settings/general",
        icon: Settings,
      },
      {
        label: "المتجر",
        path: "/settings/store",
        icon: Store,
      },
      {
        label: "الدفع",
        path: "/settings/payment-methods",
        icon: CreditCard,
      },
      {
        label: "التوصيل",
        path: "/settings/delivery",
        icon: Truck,
      },
      {
        label: "النطاق",
        path: "/settings/domain",
        icon: Globe,
      },
      {
        label: "الشروط والأحكام",
        path: "/settings/policies/terms-and-conditions",
        icon: FileText,
      },
      {
        label: "اختصارات",
        path: "/settings/shortcuts",
        icon: Keyboard,
      },
    ],
  },
  {
    label: "الإشعارات",
    path: "/notifications",
    icon: Bell,
    gradient: "from-green-500 to-green-600",
    description: "إدارة الإشعارات",
  },
  {
    label: "الدعم",
    path: "/tickets",
    icon: MessageCircle,
    gradient: "from-cyan-500 to-cyan-600",
    description: "إدارة الدعم",
  },
  {
    label: "المحاسبة",
    path: "/accounting",
    icon: Calculator,
    gradient: "from-green-500 to-green-600",
    description: "إدارة الحسابات المالية",
  },
  {
    label: "متجر التطبيقات",
    path: "/app-store",
    icon: AppWindow,
    gradient: "from-purple-500 to-purple-600",
    description: "تطبيقات مع إمكانية التكامل",
    badge: "جديد",
  },
];

type ShortcutItem = { description: string; keys: React.ReactNode };

const shortcutItems: ShortcutItem[] = [
  {
    description: "انتقل الى الصفحة الرئيسية",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>H</Kbd>
      </KbdGroup>
    ),
  },
  {
    description: "عرض قائمة التنقل",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    ),
  },
  {
    description: "افتح الإعدادات",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>,</Kbd>
      </KbdGroup>
    ),
  },
  {
    description: "افتح قائمة الاختصارات",
    keys: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>/</Kbd>
      </KbdGroup>
    ),
  },
];

const QuickNavigate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openShortcutsDialog, setOpenShortcutsDialog] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const filteredApps = useMemo((): SearchableItem[] => {
    const q = query.trim().toLowerCase();
    const items: SearchableItem[] = [];

    for (const app of baseApps) {
      const hasSubItems = app.subItems && app.subItems.length > 0;
      const appMatches =
        !q ||
        app.label.toLowerCase().includes(q) ||
        (app.description?.toLowerCase().includes(q) ?? false);

      if (hasSubItems) {
        // Parent: include when no query, or when parent matches
        if (!q || appMatches) {
          items.push({
            label: app.label,
            path: app.path,
            icon: app.icon,
            gradient: app.gradient,
            description: app.description,
            badge: app.badge,
          });
        }
        // SubItems: only when there is a query; include each matching subItem
        if (q) {
          for (const sub of app.subItems!) {
            if (sub.label.toLowerCase().includes(q)) {
              items.push({
                label: sub.label,
                path: sub.path,
                icon: sub.icon,
                gradient: app.gradient,
              });
            }
          }
        }
      } else {
        // No subItems: same as before
        if (!q || appMatches) {
          items.push({
            label: app.label,
            path: app.path,
            icon: app.icon,
            gradient: app.gradient,
            description: app.description,
            badge: app.badge,
          });
        }
      }
    }

    return items;
  }, [query]);

  useEffect(() => {
    // When results change, keep first result "active" so Enter can navigate immediately.
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    const trap = new Mousetrap(document.documentElement);

    // Allow Ctrl+K even when focused inside inputs/textareas.
    trap.stopCallback = (e, element, combo) => {
      if (combo === "ctrl+h" || combo === "command+h") return false;
      if (combo === "ctrl+k" || combo === "command+k") return false;
      if (combo === "ctrl+," || combo === "command+,") return false;
      if (combo === "ctrl+/" || combo === "command+/") return false;
      return Mousetrap.stopCallback(e as any, element, combo);
    };

    // keydown: prevent browser defaults (Ctrl+H history, Ctrl+K address bar, etc.)
    const preventBrowserDefault = (e: KeyboardEvent) => {
      e.preventDefault();
    };

    const toggle = () => {
      setOpenShortcutsDialog(false);
      setOpen((v) => !v);
    };

    const handleCtrlH = () => {
      if (location.pathname === "/") return;
      setOpen(false);
      setOpenShortcutsDialog(false);
      navigate("/");
    };

    const handleCtrlSettings = () => {
      if (location.pathname.startsWith("/settings")) return;
      setOpen(false);
      setOpenShortcutsDialog(false);
      navigate("/settings/general");
    };

    const handleCtrlShortcuts = () => {
      if (location.pathname === "/settings/shortcuts") return;
      setOpen(false);
      setOpenShortcutsDialog((v) => !v);
    };

    // keydown: block browser shortcuts (must run before keyup / browser default)
    trap.bind(["ctrl+h", "command+h"], preventBrowserDefault, "keydown");
    trap.bind(["ctrl+k", "command+k"], preventBrowserDefault, "keydown");
    trap.bind(["ctrl+,", "command+,"], preventBrowserDefault, "keydown");
    trap.bind(["ctrl+/", "command+/"], preventBrowserDefault, "keydown");

    // keyup: run our actions once per press (avoids repeat when holding)
    trap.bind(["ctrl+h", "command+h"], handleCtrlH, "keyup");
    trap.bind(["ctrl+k", "command+k"], toggle, "keyup");
    trap.bind(["ctrl+,", "command+,"], handleCtrlSettings, "keyup");
    trap.bind(["ctrl+/", "command+/"], handleCtrlShortcuts, "keyup");

    return () => {
      trap.unbind(["ctrl+k", "command+k"]);
      trap.unbind("esc");
      trap.reset();
    };
  }, [location.pathname]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  const onSelect = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const openShortcutsPage = () => {
    setOpenShortcutsDialog(false);
    navigate("/settings/shortcuts");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[640px]"
          dir="rtl"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">انتقل إلى</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const selected =
                      filteredApps[activeIndex] ?? filteredApps[0];
                    if (selected) {
                      e.preventDefault();
                      onSelect(selected.path);
                    }
                  }

                  if (e.key === "ArrowDown") {
                    const first = resultRefs.current[0];
                    if (first) {
                      e.preventDefault();
                      setActiveIndex(0);
                      first.focus();
                    }
                  }
                }}
                placeholder="ابحث عن صفحة..."
                className="pr-10"
                dir="rtl"
              />
            </div>

            <div className="max-h-[360px] overflow-auto rounded-md border">
              {filteredApps.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-right">
                  لا توجد نتائج
                </div>
              ) : (
                <div className="divide-y">
                  {filteredApps.map((app, idx) => {
                    const Icon = app.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={app.path}
                        type="button"
                        onClick={() => onSelect(app.path)}
                        ref={(el) => {
                          resultRefs.current[idx] = el;
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onFocus={() => setActiveIndex(idx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(app.path);
                          }

                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            const next = Math.min(
                              idx + 1,
                              filteredApps.length - 1
                            );
                            setActiveIndex(next);
                            resultRefs.current[next]?.focus();
                          }

                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (idx === 0) {
                              inputRef.current?.focus();
                              return;
                            }
                            const prev = Math.max(idx - 1, 0);
                            setActiveIndex(prev);
                            resultRefs.current[prev]?.focus();
                          }
                        }}
                        aria-selected={isActive}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 text-right transition-colors",
                          isActive ? "bg-accent" : "hover:bg-accent",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        )}
                      >
                        <div
                          className={cn(
                            "shrink-0 rounded-md bg-linear-to-br p-2 text-white",
                            app.gradient
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{app.label}</span>
                            {app.badge ? (
                              <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
                                {app.badge}
                              </span>
                            ) : null}
                          </div>
                          {app.description ? (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {app.description}
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-right">
              اختصار: <span className="font-mono">Ctrl + K</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openShortcutsDialog} onOpenChange={setOpenShortcutsDialog}>
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[480px]"
          dir="rtl"
        >
          <DialogHeader className="text-right">
            <div className="flex items-center gap-2">
              <Keyboard className="size-5 text-muted-foreground" />
              <DialogTitle className="text-right">
                اختصارات لوحة المفاتيح
              </DialogTitle>
            </div>
            <DialogDescription className="text-right">
              اختصارات عامة متاحة في جميع أجزاء التطبيق.
            </DialogDescription>
          </DialogHeader>
          <div className="divide-y divide-border">
            {shortcutItems.map(({ description, keys }, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-sm text-foreground">{description}</span>
                <div className="shrink-0">{keys}</div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={openShortcutsPage}
              className="text-sm text-primary hover:underline"
            >
              عرض كامل قائمة الاختصارات في الإعدادات
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickNavigate;
