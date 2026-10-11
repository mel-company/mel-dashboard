import PlanUpgradeGate from "@/components/PlanUpgradeGate";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";
import ComingSoon from "../miscellaneous/ComingSoon";

const AddEmployee = () => {
  const { isLocked, isLoading } = usePlanEntitlements();

  if (!isLoading && isLocked("team_users")) {
    return <PlanUpgradeGate feature="team_users" />;
  }

  return (
    <ComingSoon
      title="إضافة موظف جديد"
      description="هذا التطبيق قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!"
      backTo="/employees"
      backLabel="العودة إلى الموظفين"
    />
  );
};

export default AddEmployee;
