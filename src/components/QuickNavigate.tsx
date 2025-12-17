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
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import Mousetrap from "mousetrap";
import { useNavigate } from "react-router-dom";

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
}

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

const QuickNavigate = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseApps;
    return baseApps.filter(
      (app) =>
        app.label.toLowerCase().includes(q) ||
        (app.description?.toLowerCase().includes(q) ?? false)
    );
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
      if (combo === "ctrl+k" || combo === "command+k") return false;
      return Mousetrap.stopCallback(e as any, element, combo);
    };

    const toggle = (e: KeyboardEvent) => {
      e.preventDefault();
      setOpen((v) => !v);
    };

    trap.bind(["ctrl+k", "command+k"], toggle);
    trap.bind("esc", () => setOpen(false));

    return () => {
      trap.unbind(["ctrl+k", "command+k"]);
      trap.unbind("esc");
      trap.reset();
    };
  }, []);

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

  return (
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
                  const selected = filteredApps[activeIndex] ?? filteredApps[0];
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
  );
};

export default QuickNavigate;
