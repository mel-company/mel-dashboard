import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Clock,
  Grid3x3,
  LogOut,
  User,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useRef, useState } from "react";
import { useLogout, useMe } from "@/api/wrappers/auth.wrappers";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  useFetchNotificationSample,
  useUpdateNotificationReadStatus,
} from "@/api/wrappers/notification.wrappers";

type Props = {};

const TopBar = ({}: Props) => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { mutate: logoutMutation } = useLogout();
  const { data: me } = useMe();
  const { data: notifications, isLoading: isNotificationsLoading } =
    useFetchNotificationSample(isNotificationOpen);

  // Mutation to update read status
  const { mutate: updateReadStatus } = useUpdateNotificationReadStatus();

  const handleLogout = () => {
    logoutMutation(
      {},
      {
        onSuccess: (data: any) => {
          console.log("Successfully logged out: ", data);
          toast.success("تم تسجيل الخروج بنجاح");
          navigate("/login", { replace: true });
        },
      }
    );
  };

  // Show apps grid if on home page
  const isHomePage = location.pathname === "/";
  const shouldShowApps = isHomePage;

  const latestNotifications = notifications || [];

  const unreadCount = me?.notificationsCount || 0;

  // Format date for notification
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <>
      <header className="grid grid-cols-3 py-3  border-b border-border bg-background px-4 sm:px-6 shadow-sm">
        {/* Left Side - Apps Button */}
        <div className="flex justify-start items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className={cn(
              "flex items-center gap-2",
              shouldShowApps && "bg-accent"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden sm:inline">التطبيقات</span>
          </Button>
        </div>

        {/* Center - Company Name */}
        <div className="flex justify-center items-center">
          <h2 className="hidden lg:block text-lg font-semibold text-foreground">
            {me?.store || "منصة ميل"}
          </h2>
        </div>

        {/* Right Side - Icons and User */}
        <div className="flex justify-end items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div ref={notificationRef} className="relative">
            <div
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative cursor-pointer flex items-center gap-x-2 py-2 px-3 rounded-md hover:bg-accent transition-colors border border-border"
            >
              <div className="relative">
                <Bell size={20} className="size-5" />
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 ">
                    <div className="relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-red-500 animate-pulse" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full bg-red-500/50 animate-ping" />
                    </div>
                  </div>
                )}
              </div>

              {unreadCount > 99 ? "99+" : unreadCount > 0 ? unreadCount : ""}
            </div>
            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-border">
                  <h3 className="text-sm font-semibold text-right">
                    الإشعارات
                  </h3>
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                    className="flex items-center text-accent hover:bg-foreground/90 bg-foreground group rounded-md p-1 transition-colors"
                  >
                    <span className="w-full text-sm flex group-hover:underline">
                      الكل
                    </span>
                    <ArrowLeft className="size-4" />
                  </Link>
                </div>
                <div className="overflow-y-auto max-h-64 hide-scrollbar">
                  {isNotificationsLoading ? (
                    <div className="divide-y divide-border">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 animate-pulse">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-2 w-2 rounded-full bg-muted shrink-0" />
                              </div>
                              <div className="h-3 bg-muted rounded w-full" />
                              <div className="h-3 bg-muted rounded w-2/3" />
                              <div className="flex items-center gap-2 mt-2">
                                <div className="h-3 w-3 bg-muted rounded" />
                                <div className="h-3 bg-muted rounded w-20" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : latestNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {latestNotifications.map((notification: any) => {
                        const isRead = notification?.recipients?.[0]?.read;
                        return (
                          <Link
                            key={notification.id}
                            to={`/notifications/${notification.id}`}
                            onClick={() => {
                              // Update read status when clicking on notification
                              if (!isRead) {
                                updateReadStatus(notification?.id, {
                                  onSuccess: () => {
                                    // Navigate to details page after updating read status
                                    setIsNotificationOpen(false);
                                    navigate(
                                      `/notifications/${notification?.id}`
                                    );
                                  },
                                  onError: () => {
                                    // Still navigate even if update fails
                                    setIsNotificationOpen(false);
                                    navigate(
                                      `/notifications/${notification?.id}`
                                    );
                                  },
                                });
                              } else {
                                setIsNotificationOpen(false);
                                navigate(`/notifications/${notification?.id}`);
                              }
                            }}
                            className={cn(
                              "block p-4 hover:bg-accent transition-colors text-right",
                              !isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium line-clamp-1">
                                    {notification.title || "بدون عنوان"}
                                  </p>
                                  {!isRead && (
                                    <span className="size-2 rounded-full bg-primary shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {notification.message || "بدون رسالة"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  <span>
                                    {formatNotificationDate(
                                      notification.createdAt
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* <div className="p-3 border-t border-border">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    <Button variant="secondary" className="w-full text-sm">
                      عرض جميع الإشعارات
                    </Button>
                  </Link>
                </div> */}
              </div>
            )}
          </div>
          <div className="flex items-center bg-accent rounded-full">
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="cursor-pointer px-3 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-pink-400 text-white font-bold text-xs">
                      {me?.fullName?.[0] || "ح"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="line-clamp-1 text-xs font-medium text-foreground">
                      {me?.fullName || "المستخدم"}
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {me?.email || "البريد الإلكتروني"}
                    </span>
                  </div>
                  <button className="cursor-pointer">
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-right">
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer gap-2 flex items-center justify-end"
                >
                  الملف الشخصي
                  <User className="w-4 h-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsLogoutDialogOpen(true)}
                  variant="destructive"
                  className="cursor-pointer gap-2 flex items-center justify-end"
                >
                  تسجيل الخروج
                  <LogOut className="w-4 h-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد تسجيل الخروج</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من تسجيل الخروج؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* <DialogCancel onClick={() => setIsLogoutDialogOpen(false)}>
              إلغاء
            </DialogCancel> */}
            <Button
              onClick={() => {
                setIsLogoutDialogOpen(false);
                handleLogout();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تسجيل الخروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TopBar;
