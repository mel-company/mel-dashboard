import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  TickDouble02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { Loader2 } from "lucide-react";
import NotificationsContent from "./components/NotificationsContent";
import NotificationFilterDialog from "./components/NotificationFilterDialog";
import NotificationsToolbar from "./components/NotificationsToolbar";
import { useNotificationsPage } from "@/hooks/use-notifications-page";

const NotificationsPage = () => {
  const actions = useNotificationsPage();

  const toolbar = (
    <NotificationsToolbar
      searchQuery={actions.searchQuery}
      onSearchChange={actions.onSearchChange}
      onFilterClick={() => actions.setIsFilterDialogOpen(true)}
      hasActiveFilters={actions.hasActiveFilters}
      activeFilterCount={actions.activeFilterCount}
      showFilterLabel
    />
  );

  return (
    <div
      className="min-h-full space-y-3 rounded-[28px] bg-surface p-3 sm:space-y-4 sm:p-4 lg:p-5"
      dir="rtl"
    >
      <div className="hidden items-start justify-between gap-4 md:flex">
    

        <div className="flex items-center gap-2 text-right">
        <div className="flex size-11 items-center justify-center rounded-xl text-foreground">
            <HugeiconsIcon
              icon={Notification01Icon}
              size={24}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h1
              className="text-[20px] font-normal leading-[28px] text-foreground"
              style={{ fontFamily: '"Setar XS", var(--font-family)' }}
            >
              الأشعارات
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {!actions.canMarkAllAsRead
                ? "جميع الإشعارات مقروءة"
                : `تمتلك ${actions.unreadCount} إشعار جديد في قائمة الاشعارات`}
            </p>
          </div>
         
        </div>


        <button
          type="button"
          onClick={actions.markAllAsRead}
          disabled={actions.isMarkingAllRead || !actions.canMarkAllAsRead}
          className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#7d26f726] bg-[#7d26f71a] px-4 text-sm font-bold text-[#7d26f7] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {actions.isMarkingAllRead ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <HugeiconsIcon icon={TickDouble02Icon} size={20} />
          )}
          {actions.canMarkAllAsRead
            ? "جعل الاشعارات مقروءة"
            : "مقروءة"}
        </button>
      </div>

      <div className="md:hidden">
        <NotificationsToolbar
          searchQuery={actions.searchQuery}
          onSearchChange={actions.onSearchChange}
          onFilterClick={() => actions.setIsFilterDialogOpen(true)}
          hasActiveFilters={actions.hasActiveFilters}
          activeFilterCount={actions.activeFilterCount}
        />
      </div>

      <NotificationsContent actions={actions} toolbar={toolbar} />

      <NotificationFilterDialog
        open={actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        filters={actions.filters}
        onApply={actions.setFilters}
        onClear={actions.handleClearFilters}
      />
    </div>
  );
};

export default NotificationsPage;
