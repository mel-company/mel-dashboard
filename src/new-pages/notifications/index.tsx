import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsContent from "./components/NotificationsContent";
import NotificationFilterDialog from "./components/NotificationFilterDialog";
import NotificationsToolbar from "./components/NotificationsToolbar";
import PageTableHeader from "@/components/table/header";
import { useNotificationsPage } from "@/hooks/use-notifications-page";
import TitleBar from "@/components/table/title-bar";

const NotificationsPage = () => {
  const actions = useNotificationsPage();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* —— Mobile header (follows light/dark theme) —— */}
      <div className="space-y-4 md:hidden">
        <div className="min-w-0 text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              الأشعارات
            </h1>
            <span className="relative inline-flex">
              <Bell className="size-5 text-slate-400 dark:text-slate-500" />
              {actions.unreadCount > 0 ? (
                <span className="absolute -top-0.5 -end-0.5 size-2 rounded-full bg-rose-500 ring-2 ring-[#f4f7fb] dark:ring-background" />
              ) : null}
            </span>
          </div>
          <p className="mt-1 text-sm text-violet-600 dark:text-violet-300">
            تمتلك{" "}
            <span className="font-semibold text-violet-700 dark:text-violet-200">
              {actions.unreadCount}
            </span>{" "}
            أشعار جديد
          </p>
        </div>

        <NotificationsToolbar
          searchQuery={actions.searchQuery}
          onSearchChange={actions.onSearchChange}
          onFilterClick={() => actions.setIsFilterDialogOpen(true)}
          hasActiveFilters={actions.hasActiveFilters}
          activeFilterCount={actions.activeFilterCount}
        />
      </div>

      {/* —— Desktop header —— */}
      <div className="hidden space-y-6 md:block">
        <TitleBar
          description={
            <p>
              تمتلك{" "}
              <span className="font-semibold text-violet-500 dark:text-violet-300">
                {actions.unreadCount}
              </span>{" "}
              اشعار جديد في قائمة الاشعارات
            </p>
          }
        >
          <Button
            className="h-11 shrink-0 gap-2 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
            onClick={actions.markAllAsRead}
            disabled={actions.isMarkingAllRead || actions.unreadCount === 0}
          >
            {actions.isMarkingAllRead ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            جعل جميع الاشعارات مقروءة
          </Button>
        </TitleBar>

        <PageTableHeader
          title=""
          searchQuery={actions.searchQuery}
          onSearchChange={actions.onSearchChange}
          searchPlaceholder="ابحث عن المنتجات"
          onFilterClick={() => actions.setIsFilterDialogOpen(true)}
          hasActiveFilters={actions.hasActiveFilters}
          activeFilterCount={actions.activeFilterCount}
        />
      </div>

      <NotificationsContent actions={actions} />

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
