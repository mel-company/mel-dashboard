import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import TicketsContent from "./components/TicketsContent";
import PageTableHeader from "@/components/table/header";
import { useTicketsPage } from "@/hooks/use-tickets-page";
import TitleBar from "@/components/table/title-bar";
import TicketFilterDialog from "@/pages/support/TicketFilterDialog";
import {
  CustomerSupportIcon,
  TrendingUp,
  Message01Icon,
  Alert01Icon,
} from "@hugeicons-pro/core-stroke-standard";

const TicketsPage = () => {
  const navigate = useNavigate();
  const actions = useTicketsPage();

  return (
    <div className="space-y-6">
      <TitleBar>
        <Button
          className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
          onClick={() => navigate("/tickets/new")}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
            <Plus className="size-4" strokeWidth={2.5} />
          </span>
          تذكرة دعم جديدة
        </Button>
      </TitleBar>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BaseCard
          icon={CustomerSupportIcon}
          title="إجمالي التذاكر"
          value={actions.stats.totalTickets.toString()}
          color="default"
        />
        <BaseCard
          icon={TrendingUp}
          title="تذاكر جديدة"
          value={actions.stats.newTickets.toString()}
          color="success"
        />
        <BaseCard
          icon={Message01Icon}
          title="تذاكر مفتوحة"
          value={actions.stats.openTickets.toString()}
          color="accent"
        />
        <BaseCard
          icon={Alert01Icon}
          title="تذاكر عاجلة"
          value={actions.stats.urgentTickets.toString()}
          color="warning"
        />
      </div>

      <PageTableHeader
        title="تذاكر الدعم"
        searchQuery={actions.searchQuery}
        onSearchChange={actions.onSearchChange}
        searchPlaceholder="ابحث في التذاكر..."
        onFilterClick={() => actions.setIsFilterDialogOpen(true)}
        hasActiveFilters={actions.hasActiveFilters}
        activeFilterCount={actions.activeFilterCount}
      />

      <TicketsContent actions={actions} />

      <TicketFilterDialog
        open={actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        values={actions.filters}
        onApply={actions.setFilters}
        onClear={actions.handleClearFilters}
      />
    </div>
  );
};

export default TicketsPage;
