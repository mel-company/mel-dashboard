import { Lock } from "lucide-react";

interface EmployeesContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const EmployeesContent = (_props: EmployeesContentProps) => {
    // Show coming soon message since the original employees page shows coming soon
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="size-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">قريباً</h2>
            <p className="text-muted-foreground mb-4">
                هذا التطبيق قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!
            </p>
        </div>
    );
};

export default EmployeesContent;
