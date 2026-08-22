import { Search } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import CustomersContent from "./components/CustomersContent";
import CustomerDeleteModal from "./components/CustomerDeleteModal";
import PageTableHeader from "@/components/table/header";
import { useCustomersPage } from "@/hooks/use-customers-page";
import TitleBar from "@/components/table/title-bar";
import { cn } from "@/lib/utils";
import {
  UserGroup03Icon,
  UserAdd01Icon,
  UserSearch01Icon,
} from "@hugeicons-pro/core-stroke-standard";

const CustomersPage = () => {
  const actions = useCustomersPage();

  return (
    <div className="space-y-4 sm:space-y-6">
      <TitleBar
        count={
          actions.stats?.newCustomers ??
          actions.customers?.length ??
          0
        }
      />

      <div className="mb-6 rounded-[28px] bg-slate-50 p-5 dark:bg-transparent md:bg-transparent md:p-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <BaseCard
            icon={UserGroup03Icon}
            title="إجمالي العملاء"
            value={actions.stats?.totalCustomers?.toString() || "0"}
            growth={-12.6}
            color="default"
          />
          <BaseCard
            icon={UserAdd01Icon}
            title="عملاء جدد"
            value={actions.stats?.newCustomers?.toString() || "0"}
            growth={-12.6}
            color="success"
          />
          <BaseCard
            icon={UserSearch01Icon}
            title="عملاء لم يقوموا بالطلب بعد"
            value={actions.stats?.noOrderCustomers?.toString() || "0"}
            growth={12.6}
            color="warning"
          />
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        <div
          className={cn(
            "flex min-h-12 min-w-0 items-center justify-between gap-2 rounded-[14px] border px-2",
            "border-slate-200 bg-white",
            "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27]",
          )}
        >
          <span className="flex h-8 shrink-0 items-center rounded-lg bg-sky-50 px-4 text-sm text-sky-600 dark:bg-[#33c5ff]/5 dark:text-[#00b7ff]">
            البحث
          </span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <input
              type="search"
              value={actions.searchQuery ?? ""}
              onChange={(e) => actions.onSearchChange?.(e.target.value)}
              placeholder="عميل"
              className="min-w-0 flex-1 bg-transparent text-right text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
            />
            <Search className="size-5 shrink-0 text-slate-400 dark:text-[#4a5596]" strokeWidth={2.25} />
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <PageTableHeader
          title="جميع العملاء"
          subtitle={`أجمالي العناصر المتاحة ${actions.customers.length}`}
          searchQuery={actions.searchQuery}
          onSearchChange={actions.onSearchChange}
          searchPlaceholder="ابحث عن عميل"
        />
      </div>

      <CustomersContent actions={actions} />

      <CustomerDeleteModal
        deleteId={actions.deleteId}
        setDeleteId={actions.setDeleteId}
        isDeleting={actions.isDeleting}
        handleDelete={actions.handleDelete}
      />
    </div>
  );
};

export default CustomersPage;
