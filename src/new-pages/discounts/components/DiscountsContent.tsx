import { Percent, Lock } from "lucide-react";

interface DiscountsContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const DiscountsContent = ({ actions, navigate }: DiscountsContentProps) => {
    // Show coming soon message since discounts functionality is not fully implemented
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Percent className="size-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">قريباً</h2>
            <p className="text-muted-foreground mb-4">
                نظام الخصومات قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!
            </p>
        </div>
    );
};

export default DiscountsContent;
