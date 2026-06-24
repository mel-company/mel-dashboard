import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import NotificationsContent from "./components/NotificationsContent";
import PageTableHeader from "@/components/table/header";
import { useNotificationsPage } from "@/hooks/use-notifications-page";
import TitleBar from "@/components/table/title-bar";
import { Notification01Icon, TrendingUp, Mail01Icon, BellIcon } from "@hugeicons-pro/core-stroke-standard";

const NotificationsPage = () => {
    const navigate = useNavigate();

    const actions = useNotificationsPage();

    return (
        <div className="space-y-6">
            {/* Header */}
            <TitleBar>
                <Button
                    className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
                    onClick={() => navigate("/notifications/add")}
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
                        <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                    إشعار جديد
                </Button>
            </TitleBar>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <BaseCard
                    icon={Notification01Icon}
                    title="إجمالي الإشعارات"
                    value={actions.stats?.totalNotifications?.toString() || "0"}
                    color="default"
                />
                <BaseCard
                    icon={TrendingUp}
                    title="إشعارات جديدة"
                    value={actions.stats?.newNotifications?.toString() || "0"}
                    color="success"
                />
                <BaseCard
                    icon={Mail01Icon}
                    title="إشعارات مقروءة"
                    value={actions.stats?.readNotifications?.toString() || "0"}
                    color="accent"
                />
                <BaseCard
                    icon={BellIcon}
                    title="إشعارات غير مقروءة"
                    value={actions.stats?.unreadNotifications?.toString() || "0"}
                    color="warning"
                />
            </div>

            {/* Toolbar */}
            <PageTableHeader
                {...actions}
                title={"الإشعارات"}
            />

            {/* Content */}
            <NotificationsContent actions={actions} navigate={navigate} />

        </div>
    );
};

export default NotificationsPage;
