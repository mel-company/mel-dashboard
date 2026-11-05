import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import EmployeesContent from "./components/EmployeesContent";
import EmployeeDeleteModal from "./components/EmployeeDeleteModal";
import PageTableHeader from "@/components/table/header";
import { useEmployeesPage } from "@/hooks/use-employees-page";
import TitleBar from "@/components/table/title-bar";
import {
  User02Icon,
  DatabaseIcon,
  PackageDeliveredIcon,
  UserGroupIcon,
} from "@hugeicons-pro/core-stroke-standard";
import PagePanel from "@/components/PagePanel";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";
import PendingInvitesCard from "./components/PendingInvitesCard";
import JoinRequestsCard from "./components/JoinRequestsCard";
import {
  useFetchStoreAccessRequests,
} from "@/api/wrappers/access-request.wrappers";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { isLocked, goUpgrade } = usePlanEntitlements();
  const actions = useEmployeesPage();
  const { data: accessRequests = [] } = useFetchStoreAccessRequests(true);
  const pendingAccess = accessRequests.filter((r) => r.status === "PENDING")
    .length;

  const listToolbar = (
    <PageTableHeader
      title="جميع الموظفين"
      subtitle={`أجمالي العناصر المتاحة ${actions.employees.length}`}
      searchQuery={actions.searchQuery}
      onSearchChange={actions.onSearchChange}
      searchPlaceholder="ابحث عن موظف"
    />
  );

  const deleting = actions.employees.find(
    (e: any) => e.id === actions.deleteId,
  );

  return (
    <PagePanel className="space-y-6">
      <TitleBar count={actions.stats?.totalEmployees ?? 0}>
        <div className="flex flex-wrap gap-2">
          {pendingAccess > 0 ? (
            <Button
              variant="outline"
              className="h-11 shrink-0 gap-2 rounded-full border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
              onClick={() => navigate("/access-requests")}
            >
              طلبات صلاحية ({pendingAccess})
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-11 shrink-0 rounded-full"
              onClick={() => navigate("/access-requests")}
            >
              طلبات الصلاحيات
            </Button>
          )}
          <Button
            className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
            onClick={() => {
              if (isLocked("team_users")) {
                goUpgrade("team_users");
                return;
              }
              navigate("/employees/add");
            }}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            دعوة موظف
          </Button>
        </div>
      </TitleBar>

      <JoinRequestsCard />
      <PendingInvitesCard />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <BaseCard
          icon={User02Icon}
          title="إجمالي الموظفين"
          value={actions.stats?.totalEmployees?.toString() || "0"}
          color="default"
        />
        <BaseCard
          icon={DatabaseIcon}
          title="مسؤولو الداتا"
          value={actions.stats?.dataManagers?.toString() || "0"}
          color="accent"
        />
        <BaseCard
          icon={PackageDeliveredIcon}
          title="مسؤولو الطلبات"
          value={actions.stats?.ordersManagers?.toString() || "0"}
          color="success"
        />
        <BaseCard
          icon={UserGroupIcon}
          title="المقاعد المستخدمة"
          value={`${(actions.stats?.seatsUsed ?? 0) + (actions.stats?.pendingInvites ?? 0)}/${actions.stats?.seatsMax ?? 1}`}
          color="warning"
        />
      </div>

      <EmployeesContent actions={actions} toolbar={listToolbar} />

      <EmployeeDeleteModal
        deleteId={actions.deleteId}
        setDeleteId={actions.setDeleteId}
        isDeleting={actions.isDeleting}
        handleDelete={actions.handleDelete}
        employeeName={deleting?.user?.name}
      />
    </PagePanel>
  );
};

export default EmployeesPage;
