import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import OrdersContent from "./components/OrdersContent";
import PageTableHeader from "@/components/table/header";
import { useOrdersPage } from "@/hooks/use-orders-page";
import TitleBar from "@/components/table/title-bar";
import { ShoppingCart01Icon, Package01Icon, CheckmarkCircle03Icon, CircleIcon } from "@hugeicons-pro/core-stroke-standard";

const OrdersPage = () => {
    const navigate = useNavigate();

    const actions = useOrdersPage();

    return (
        <div className="space-y-6">
            {/* Header */}
            <TitleBar>
                <Button
                    className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
                    onClick={() => navigate("/orders/add")}
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
                        <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                    إضافة طلب جديد
                </Button>
            </TitleBar>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <BaseCard
                    icon={ShoppingCart01Icon}
                    title="إجمالي الطلبات"
                    value={actions.stats?.totalOrders?.toString() || "0"}
                    color="default"
                />
                <BaseCard
                    icon={Package01Icon}
                    title="طلبات معلقة"
                    value={actions.stats?.pendingOrders?.toString() || "0"}
                    color="warning"
                />
                <BaseCard
                    icon={CheckmarkCircle03Icon}
                    title="طلبات مكتملة"
                    value={actions.stats?.completedOrders?.toString() || "0"}
                    color="success"
                />
                <BaseCard
                    icon={CircleIcon}
                    title="طلبات ملغية"
                    value={actions.stats?.cancelledOrders?.toString() || "0"}
                    color="danger"
                />
            </div>

            {/* Toolbar */}
            <PageTableHeader
                {...actions}
                title={"الطلبات"}
                onFilterClick={() => actions.setIsFilterDialogOpen(true)}
            />

            {/* Content */}
            <OrdersContent actions={actions} navigate={navigate} />

        </div >
    );
};

export default OrdersPage;
