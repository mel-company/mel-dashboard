import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useUpdateGroup } from "@/api/wrappers/group.wrappers";
import GroupPreviewCard from "./GroupPreviewCard";
import { formatDate, formatTime } from "../utils";

type GroupCardsProps = {
  groups: any[];
  imageBaseUrl?: string;
  refetch?: () => void;
};

const GroupCards = ({
  groups,
  imageBaseUrl = "",
  refetch,
}: GroupCardsProps) => {
  return (
    <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          imageBaseUrl={imageBaseUrl}
          refetch={refetch}
        />
      ))}
    </div>
  );
};

const GroupCard = ({
  group,
  imageBaseUrl,
  refetch,
}: {
  group: any;
  imageBaseUrl?: string;
  refetch?: () => void;
}) => {
  const [data, setData] = useState(group);
  const { mutate: updateGroup } = useUpdateGroup();
  const updatedAt = data.updatedAt ?? data.createdAt;

  useEffect(() => {
    setData(group);
  }, [group]);

  const handleToggle = (checked: boolean) => {
    setData({ ...data, enabled: checked });
    const formData = new FormData();
    formData.append("name", data.name ?? "");
    formData.append("enabled", String(checked));
    updateGroup(
      { id: group.id, data: formData },
      {
        onSuccess: () => refetch?.(),
        onError: () => {
          setData(group);
          toast.error("فشل تحديث حالة المجموعة");
        },
      },
    );
  };

  return (
    <Link to={`/category-group/${group.id}`} className="block">
      <GroupPreviewCard
        group={data}
        imageBaseUrl={imageBaseUrl}
        footer={
          <div
            className="flex items-center justify-between gap-2"
            dir="ltr"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Switch
              onToggle={handleToggle}
              checked={data.enabled}
              activeLabel="نشط"
              disabledLabel="مخفي"
            />
            <div className="text-right" dir="rtl">
              <p className="text-xs text-slate-900 dark:text-[#e4e7fc]">
                {formatDate(updatedAt)}
              </p>
              <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
                {formatTime(updatedAt)}
              </p>
            </div>
          </div>
        }
      />
    </Link>
  );
};

export default GroupCards;
