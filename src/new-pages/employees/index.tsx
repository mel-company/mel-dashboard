import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import EmployeesContent from "./components/EmployeesContent";
import PageTableHeader from "@/components/table/header";
import { useEmployeesPage } from "@/hooks/use-employees-page";
import TitleBar from "@/components/table/title-bar";
import { User02Icon, TrendingUpDownIcon, AiPhone01Icon, Briefcase01Icon } from "@hugeicons-pro/core-stroke-standard";

const EmployeesPage = () => {
    const navigate = useNavigate();

    const actions = useEmployeesPage();

    return (
        <div className="space-y-6">
            {/* Header */}
            <TitleBar>
                <Button
                    className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
                    onClick={() => navigate("/employees/add")}
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
                        <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                    إضافة موظف جديد
                </Button>
            </TitleBar>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <BaseCard 
                    icon={User02Icon} 
                    title="إجمالي الموظفين" 
                    value={actions.stats?.totalEmployees?.toString() || "0"} 
                    color="default"
                />
                <BaseCard 
                    icon={TrendingUpDownIcon} 
                    title="موظفون جدد" 
                    value={actions.stats?.newEmployees?.toString() || "0"} 
                    color="success"
                />
                <BaseCard 
                    icon={AiPhone01Icon} 
                    title="موظفون نشطون" 
                    value={actions.stats?.activeEmployees?.toString() || "0"} 
                    color="accent"
                />
                <BaseCard 
                    icon={Briefcase01Icon} 
                    title="إجمالي الأقسام" 
                    value={actions.stats?.totalDepartments?.toString() || "0"} 
                    color="warning"
                />
            </div>

            {/* Toolbar */}
            <PageTableHeader
                {...actions}
                title={"الموظفين"}
            />

            {/* Content */}
            <EmployeesContent actions={actions} navigate={navigate} />

        </div>
    );
};

export default EmployeesPage;
