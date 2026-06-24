import { Bell, Lock } from "lucide-react";

interface NotificationsContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const NotificationsContent = ({ actions, navigate }: NotificationsContentProps) => {
    // Show coming soon message since notifications functionality is not fully implemented
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="size-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">قريباً</h2>
            <p className="text-muted-foreground mb-4">
                نظام الإشعارات قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!
            </p>
        </div>
    );
};

export default NotificationsContent;
