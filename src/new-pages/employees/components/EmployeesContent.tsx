import { Lock } from "lucide-react";

interface EmployeesContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const EmployeesContent = (_props: EmployeesContentProps) => {
    // Show coming soon message since the original employees page shows coming soon
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-transparent bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-950">
            <Lock className="mb-4 size-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">قريباً</h2>
            <p className="mb-4 text-muted-foreground">
                هذا التطبيق قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!
            </p>
        </div>
    );
};

export default EmployeesContent;
