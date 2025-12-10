import { useState } from "react";
import { Link } from "react-router-dom";
import { dmy_users, dmy_orders } from "@/data/dummy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  User,
  MapPin,
  Phone,
  ShoppingBag,
  FileText,
} from "lucide-react";

type Props = {};

const Customers = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Get order count for a customer
  const getOrderCount = (userId: number) => {
    return dmy_orders.filter((order) => order.user_id === userId).length;
  };

  // Filter customers based on search query
  const filteredCustomers = dmy_users.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add Customer Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ابحث عن عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2" onClick={() => {}}>
          <Plus className="size-4" />
          إضافة عميل
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم العميل</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">الموقع</TableHead>
              <TableHead className="text-right">عدد الطلبات</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <User className="size-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">
                      لا يوجد عملاء
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery
                        ? "لم يتم العثور على عملاء يطابقون البحث"
                        : "ابدأ بإضافة عميل جديد"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => {
                const orderCount = getOrderCount(customer.id);
                return (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">#{customer.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <MapPin className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {customer.location}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {orderCount} {orderCount === 1 ? "طلب" : "طلبات"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="size-4" />
                          التفاصيل
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Customers;
