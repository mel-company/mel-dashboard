import { useNavigate } from "react-router-dom";
import {
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import { getProductCoverImage } from "@/utils/product-images";
import Rating from "@/components/table/rating";
import { costMargin, formatPrice, getProductCategories, shortDescription } from "../utils";
import Badge from "@/components/table/badge";
import type { ProductListItem } from "@/api/types/product";

function renderCategories(product: ProductListItem) {
    const cats = getProductCategories(product);
    if (cats.length === 0) {
        return <span className="text-xs text-muted-foreground">بدون فئة</span>;
    }
    return (
        <div className="flex max-w-[180px] flex-wrap gap-1.5">
            {cats.slice(0, 3).map((c) => (
                <Badge key={c.id} color="purple">
                    {c.name}
                </Badge>
            ))}
            {cats.length > 3 && (
                <span className="text-xs text-muted-foreground">+{cats.length - 3}</span>
            )}
        </div>
    );
}

const ProductRow = ({
    product,
    onDelete,
    rowIndex,
    imageBaseUrl = "",
}: {
    product: ProductListItem;
    onDelete: (id: string) => void;
    rowIndex: number;
    imageBaseUrl?: string;
}) => {
    const navigate = useNavigate();
    const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";
    const margin = costMargin(product.price, product.cost_to_produce);
    const cover = getProductCoverImage(product);

    return (
        <TableRow
            className="cursor-pointer"
            onClick={() => navigate(`/products/${product.id}`)}
        >
            <TableCell className={cn(tdClass, "text-muted-foreground")}>
                {String(rowIndex + 1).padStart(2, "0")}
            </TableCell>
            <TableCell className={cn(tdClass, "w-16")}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                    <AssetImage
                        image={cover}
                        baseUrl={imageBaseUrl}
                        alt={product.title}
                        className="block h-12 w-12 object-cover"
                        fallback={<Package className="size-5 text-muted-foreground" />}
                    />
                </div>
            </TableCell>
            <TableCell className={tdClass}>
                <p className="line-clamp-1 font-semibold leading-snug">{product.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {shortDescription(product.description, 70)}
                </p>
            </TableCell>
            <TableCell className={tdClass}>{renderCategories(product)}</TableCell>
            <TableCell className={cn(tdClass, "font-medium tabular-nums")}>
                {formatPrice(product.price)}
            </TableCell>
            <TableCell className={tdClass}>
                <p className="font-medium tabular-nums">
                    {product.cost_to_produce
                        ? formatPrice(product.cost_to_produce)
                        : "—"}
                </p>
                {margin !== null && (
                    <p
                        className={cn(
                            "mt-0.5 text-xs font-medium tabular-nums",
                            margin >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400",
                        )}
                    >
                        {Math.abs(margin).toFixed(1)}% {margin >= 0 ? "↑" : "↓"}
                    </p>
                )}
            </TableCell>
            <TableCell className={tdClass}>
                {typeof product.rate === "number" ? (
                    <div className="flex items-center justify-end gap-1">
                        <Rating count={product.rate} />
                    </div>
                ) : (
                    "—"
                )}
            </TableCell>
            <TableCell className={tdClass}>
                <Badge color={product.enabled ? "success" : "default"}>
                    {product.enabled ? "متاح" : "مخفي"}
                </Badge>
            </TableCell>
            <TableCell className={tdClass}>
                <div
                    className="flex items-center justify-end gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(`/products/${product.id}`)}
                        title="عرض"
                    >
                        <Eye className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        title="تعديل"
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(product.id)}
                        title="حذف"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default ProductRow;
