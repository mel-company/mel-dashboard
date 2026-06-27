import { BaseCard } from "@/components/table/top-cards";
import CustomersContent from "./components/CustomersContent";
import CustomerDeleteModal from "./components/CustomerDeleteModal";
import PageTableHeader from "@/components/table/header";
import { useCustomersPage } from "@/hooks/use-customers-page";
import TitleBar from "@/components/table/title-bar";
import {
  UserGroup03Icon,
  UserAdd01Icon,
  UserSearch01Icon,
} from "@hugeicons-pro/core-stroke-standard";

const CustomersPage = () => {
  const actions = useCustomersPage();

  return (
    <div className="space-y-6">
      <TitleBar description="تمتلك 46 حركة جديدة في قائمة العملاء" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BaseCard
          icon={UserGroup03Icon}
          title="إجمالي العملاء"
          value={actions.stats?.totalCustomers?.toString() || "0"}
          growth={12.6}
          color="default"
        />
        <BaseCard
          icon={UserAdd01Icon}
          title="عملاء جدد"
          value={actions.stats?.newCustomers?.toString() || "0"}
          growth={12.6}
          color="success"
        />
        <BaseCard
          icon={UserSearch01Icon}
          title="عملاء لم يقوموا بالطلب بعد"
          value={actions.stats?.noOrderCustomers?.toString() || "0"}
          growth={0}
          color="warning"
        />
      </div>

      <PageTableHeader
        title="جميع العملاء"
        searchQuery={actions.searchQuery}
        onSearchChange={actions.onSearchChange}
        searchPlaceholder="ابحث عن عميل"
      />

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
