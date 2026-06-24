import { MessageSquare, Lock } from "lucide-react";

interface TicketsContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const TicketsContent = ({ actions, navigate }: TicketsContentProps) => {
    // Show coming soon message since tickets functionality is not fully implemented
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="size-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">قريباً</h2>
            <p className="text-muted-foreground mb-4">
                نظام تذاكر الدعم قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!
            </p>
        </div>
    );
};

export default TicketsContent;
