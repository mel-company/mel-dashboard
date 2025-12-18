import { Lock } from "lucide-react";
import { useState } from "react";

type Props = {};

const AddEmployee = ({}: Props) => {
  // @ts-ignore
  const [isCommingSoon, setIsCommingSoon] = useState(true);

  if (isCommingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Lock className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">قريباً</h2>
        <p className="text-muted-foreground mb-4">
          هذا التطبيق قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!
        </p>
      </div>
    );
  }

  return <div>AddEmployee</div>;
};

export default AddEmployee;
