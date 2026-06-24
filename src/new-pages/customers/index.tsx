import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import CustomersContent from "./components/CustomersContent";
import PageTableHeader from "@/components/table/header";
import { useCustomersPage } from "@/hooks/use-customers-page";
import TitleBar from "@/components/table/title-bar";
import { User02Icon, TrendingUpDownIcon, AiPhone01Icon, ShoppingCart01Icon } from "@hugeicons-pro/core-stroke-standard";

const CustomersPage = () => {
    const navigate = useNavigate();

    const actions = useCustomersPage();

    return (
        <div className="space-y-6">
            {/* Header */}
            <TitleBar>
                <Button
                    className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
                    onClick={() => navigate("/customers/add")}
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
                        <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                    إضافة عميل جديد
                </Button>
            </TitleBar>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <BaseCard
                    icon={User02Icon}
                    title="إجمالي العملاء"
                    value={actions.stats?.totalCustomers?.toString() || "0"}
                    color="default"
                />
                <BaseCard
                    icon={TrendingUpDownIcon}
                    title="عملاء جدد"
                    value={actions.stats?.newCustomers?.toString() || "0"}
                    color="success"
                />
                <BaseCard
                    icon={AiPhone01Icon}
                    title="عملاء نشطون"
                    value={actions.stats?.activeCustomers?.toString() || "0"}
                    color="accent"
                />
                <BaseCard
                    icon={ShoppingCart01Icon}
                    title="إجمالي الطلبات"
                    value={actions.stats?.totalOrders?.toString() || "0"}
                    color="warning"
                />
            </div>

            {/* Toolbar */}
            <PageTableHeader
                {...actions}
                title={"العملاء"}
            />

            {/* Content */}
            <CustomersContent actions={actions} navigate={navigate} />

        </div >
    );
};

export default CustomersPage;
