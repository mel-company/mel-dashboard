import type { ReactNode } from "react";
import { User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import LoadMore from "@/components/table/load-more";
import EmployeeTable from "./EmployeeTable";
import EmployeeCard from "./EmployeeCard";

interface EmployeesContentProps {
  toolbar?: ReactNode;
  actions: any;
}

const EmployeesContent = ({ actions, toolbar }: EmployeesContentProps) => {
  const navigate = useNavigate();

  if (actions.isLoading && actions.employees.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-slate-400 dark:bg-[#0a0e27]">
        جاري التحميل…
      </div>
    );
  }

  if (actions.error && actions.employees.length === 0) {
    return (
      <ErrorPage
        error={actions.error}
        onRetry={() => actions.refetch()}
        isRetrying={false}
      />
    );
  }

  if (actions.employees.length === 0) {
    return <EmptyCard actions={actions} />;
  }

  return (
    <>
      <div className="xl:hidden">
        <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b]">
          <div className="mb-2 px-2 pt-1 text-right">
            <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">
              جميع الموظفين
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
              أجمالي العناصر المتاحة{" "}
              <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">
                {actions.employees.length}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {actions.employees.map((employee: any) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onClick={() => navigate(`/employees/${employee.id}`)}
                onDelete={() => actions.setDeleteId(employee.id)}
              />
            ))}
          </div>
        </div>
        <LoadMore {...actions} />
      </div>

      <div className="hidden xl:block">
        <EmployeeTable
          toolbar={toolbar}
          paging={actions}
          employees={actions.employees}
          onDelete={actions.setDeleteId}
        />
      </div>
    </>
  );
};

export default EmployeesContent;

const EmptyCard = ({ actions }: { actions: any }) => {
  const hasSearch = actions.search;

  return (
    <EmptyPage
      title={hasSearch ? "لا توجد نتائج" : "لا يوجد موظفون بعد"}
      description={
        hasSearch
          ? "جرّب البحث باسم أو إيميل آخر"
          : "ادعُ مسؤول داتا أو مسؤول طلبات عبر الإيميل ضمن مقاعد خطتك"
      }
      icon={<User className="size-7 text-muted-foreground" />}
      primaryAction={
        hasSearch
          ? {
              label: "مسح البحث",
              onClick: () => actions.setSearchValue(""),
              icon: <X className="size-4" />,
              variant: "outline" as const,
            }
          : {
              label: "دعوة موظف",
              to: "/employees/add",
            }
      }
    />
  );
};
