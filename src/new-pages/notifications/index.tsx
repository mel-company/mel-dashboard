import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsContent from "./components/NotificationsContent";
import NotificationFilterDialog from "./components/NotificationFilterDialog";
import PageTableHeader from "@/components/table/header";
import { useNotificationsPage } from "@/hooks/use-notifications-page";
import TitleBar from "@/components/table/title-bar";

const NotificationsPage = () => {
  const actions = useNotificationsPage();

  const subtitle = `تمتلك ${actions.unreadCount} اشعار جديد في قائمة الاشعارات`;

  return (
    <div className="space-y-6">
      <TitleBar description={subtitle}>
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
        searchPlaceholder="ابحث عن إشعار..."
        onFilterClick={() => actions.setIsFilterDialogOpen(true)}
        hasActiveFilters={actions.hasActiveFilters}
        activeFilterCount={actions.activeFilterCount}
      />

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
