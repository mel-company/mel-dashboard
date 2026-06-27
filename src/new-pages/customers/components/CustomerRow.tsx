import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ActionBtnList from "@/components/table/action-btn-list";
import Rating from "@/components/table/rating";

type CustomerRowProps = {
  customer: any;
  rowIndex: number;
  onDelete: (id: string) => void;
};

const CustomerRow = ({ customer, rowIndex, onDelete }: CustomerRowProps) => {
  const navigate = useNavigate();
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";
  const user = customer.user;
  const orderCount = customer._count?.orders ?? 0;
  const rawRating = customer.rating ?? customer.rate ?? user?.rating;
  const rating =
    typeof rawRating === "number"
      ? rawRating
      : rawRating != null
        ? Number.parseFloat(String(rawRating))
        : NaN;

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/80"
      onClick={() => navigate(`/customers/${customer.id}`)}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={cn(tdClass, "w-24")}>
        <span className="font-mono text-sm font-medium text-slate-600" dir="ltr">
          #{customer.id.slice(0, 6)}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900">{user?.name ?? "—"}</p>
      </TableCell>
      <TableCell className={cn(tdClass, "tabular-nums")} dir="ltr">
        {user?.phone ?? "—"}
      </TableCell>
      <TableCell className={tdClass}>
        <p className="line-clamp-2 text-sm text-slate-600">
          {user?.location ?? "—"}
        </p>
      </TableCell>
      <TableCell className={cn(tdClass, "font-semibold tabular-nums")}>
        {orderCount}
      </TableCell>
      <TableCell className={cn(tdClass, "text-center")}>
        {Number.isFinite(rating) ? (
          <div className="flex justify-center">
            <Rating count={rating} />
          </div>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList
          onView={() => navigate(`/customers/${customer.id}`)}
          onEdit={() => navigate(`/customers/${customer.id}`)}
          onDelete={() => onDelete(customer.id)}
        />
      </TableCell>
    </TableRow>
  );
};

export default CustomerRow;
