import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Bell, ChevronDown, Clock, Grid3x3, LogOut, User } from "lucide-react";
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
  const { data: notifications } =
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
          <h2 className="text-lg font-semibold text-foreground">
            {me?.store || "منصة ميل"}
          </h2>
        </div>

        {/* Right Side - Icons and User */}
        <div className="flex justify-end items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative cursor-pointer p-1 rounded-md hover:bg-accent transition-colors"
            >
              <Bell size={20} className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-white text-xs font-medium">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-right">
                    الإشعارات
                  </h3>
                </div>
                <div className="overflow-y-auto max-h-64 hide-scrollbar">
                  {latestNotifications.length === 0 ? (
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
                <div className="p-3 border-t border-border">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    <Button variant="secondary" className="w-full text-sm">
                      عرض جميع الإشعارات
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-accent rounded-full px-3 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-cyan text-white text-xs">
                {/* {user?.name?.[0] || "ح"} */}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-end">
              <span className="line-clamp-1 text-xs font-medium text-foreground">
                {me?.fullName || "المستخدم"}
              </span>
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {me?.email || "البريد الإلكتروني"}
              </span>
            </div>
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
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
