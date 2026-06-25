import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import AddCategoryDialog from "@/components/dialogs/AddCategoryDialog";
import CategoryFilterDialog from "@/pages/category/CategoryFilterDialog";
import { BaseCard } from "@/components/table/top-cards";
import PageTableHeader from "@/components/table/header";
import { useCategoriesPage } from "@/hooks/use-categories-page";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import CategorieGroups from "@/pages/category/category-group/CategorieGroups";
import { TrendingUpDownIcon, Package01Icon, StarIcon } from "@hugeicons-pro/core-stroke-standard";
import CategoriesContent from "./components/CategoriesContent";
import { Layers01Icon, ShapeCollectionIcon } from "@hugeicons-pro/core-duotone-rounded";
import { Fire03Icon, GitBranchIcon, GitCommitVerticalIcon, Trolley02Icon } from "@hugeicons-pro/core-bulk-rounded";

const CategoriesPage = () => {
    const actions = useCategoriesPage();
    const [showGroups, setShowGroups] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <TitleBar>
                <div className="flex items-center gap-2">
                    <SwitchTab
                        selected={showGroups ? "groups" : "categories"}
                        onChange={(value) => setShowGroups(value === "groups")}
                        options={[
                            {
                                label: "الفئات",
                                value: "categories",
                                icon: ShapeCollectionIcon
                            },
                            {
                                label: "المجموعات",
                                value: "groups",
                                icon: Layers01Icon
                            }
                        ]}
                    />
                    <Button
                        className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
                        onClick={() => actions.setIsFilterDialogOpen(true)}
                    >
                        <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
                            <Plus className="size-4" strokeWidth={2.5} />
                        </span>
                        إضافة فئة جديدة
                    </Button>
                </div>
            </TitleBar>

            {/* Conditional rendering based on toggle */}
            {showGroups ? (
                // Groups view
                <CategorieGroups />
            ) : (
                // Categories view
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <BaseCard
                            icon={Fire03Icon}
                            title="الفئات الاعلى طلباً"
                            value={actions.stats?.totalCategories?.toString() || "0"}
                            color="warning"
                            growth={12.6}
                        />
                        <BaseCard
                            icon={GitCommitVerticalIcon}
                            title="اجمالي الفئات الرئيسية"
                            value={actions.stats?.activeCategories?.toString() || "0"}
                            color="accent"
                        />
                        <BaseCard
                            icon={GitBranchIcon}
                            title="اجمالي الفئات الفرعية"
                            value={actions.stats?.totalProducts?.toString() || "0"}
                            color="accent"
                        />
                        <BaseCard
                            icon={Trolley02Icon}
                            title="أجمالي الفئات المعطلة"
                            value={actions.stats?.featuredCategories?.toString() || "0"}
                            color="danger"
                        />
                    </div>

                    {/* Toolbar */}
                    <PageTableHeader
                        {...actions}
                        title={"الفئات"}
                        onFilterClick={() => actions.setIsFilterDialogOpen(true)}
                    >
                        <SwitchTab
                            selected={actions.viewMode}
                            onChange={(value) => actions.handleViewModeChange(value as "table" | "cards")}
                        />
                    </PageTableHeader>

                    {/* Content */}
                    <CategoriesContent actions={actions} />
                </>
            )}

            <AddCategoryDialog open={actions.isFilterDialogOpen} onOpenChange={actions.setIsFilterDialogOpen} />
            <CategoryFilterDialog
                open={actions.isFilterDialogOpen}
                onOpenChange={actions.setIsFilterDialogOpen}
                values={actions.filters}
                onApply={actions.setFilters}
                onClear={actions.handleClearFilters}
            />

        </div >
    );
};

export default CategoriesPage;
