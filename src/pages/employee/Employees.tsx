import { useState } from "react";
import { Link } from "react-router-dom";
import { dmy_employees } from "@/data/dummy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  Briefcase,
  FileText,
} from "lucide-react";

type Props = {};

const Employees = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter employees based on search query
  const filteredEmployees = dmy_employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phone.includes(searchQuery) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add Employee Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ابحث عن موظف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2" onClick={() => {}}>
          <Plus className="size-4" />
          إضافة موظف
        </Button>
      </div>

      {/* Employees Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الموظف</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">المنصب</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <User className="size-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">
                      لا يوجد موظفون
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery
                        ? "لم يتم العثور على موظفين يطابقون البحث"
                        : "ابدأ بإضافة موظف جديد"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => {
                return (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">#{employee.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-medium">{employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Briefcase className="size-3" />
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span className="text-sm">{employee.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <Mail className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {employee.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/employees/${employee.id}`}>
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

export default Employees;
