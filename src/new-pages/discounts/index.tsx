import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import DiscountsContent from "./components/DiscountsContent";
import PageTableHeader from "@/components/table/header";
import { useDiscountsPage } from "@/hooks/use-discounts-page";
import TitleBar from "@/components/table/title-bar";
import { DiscountTag01Icon, TrendingUp, PercentIcon, Calendar01Icon } from "@hugeicons-pro/core-stroke-standard";

const DiscountsPage = () => {
    const navigate = useNavigate();

    const actions = useDiscountsPage();

    return (
        <div className="space-y-6">
            {/* Header */}
            <TitleBar>
                <Button
                    className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
                    onClick={() => navigate("/discounts/add")}
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
                        <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                    إضافة خصم جديد
                </Button>
            </TitleBar>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <BaseCard
                    icon={DiscountTag01Icon}
                    title="إجمالي الخصومات"
                    value={actions.stats?.totalDiscounts?.toString() || "0"}
                    color="default"
                />
                <BaseCard
                    icon={TrendingUp}
                    title="خصومات نشطة"
                    value={actions.stats?.activeDiscounts?.toString() || "0"}
                    color="success"
                />
                <BaseCard
                    icon={PercentIcon}
                    title="متوسط الخصم"
                    value={actions.stats?.averageDiscount?.toString() || "0%"}
                    color="accent"
                />
                <BaseCard
                    icon={Calendar01Icon}
                    title="خصومات منتهية"
                    value={actions.stats?.expiredDiscounts?.toString() || "0"}
                    color="warning"
                />
            </div>

            {/* Toolbar */}
            <PageTableHeader
                {...actions}
                title={"الخصومات"}
            />

            {/* Content */}
            <DiscountsContent actions={actions} navigate={navigate} />

        </div>
    );
};

export default DiscountsPage;
