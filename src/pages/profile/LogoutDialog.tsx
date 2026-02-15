import { useLogout } from "@/api/wrappers/auth.wrappers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Props = {};

const LogoutDialog = ({}: Props) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { mutate: logoutMutation } = useLogout();

  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation(
      {},
      {
        onSuccess: (data: any) => {
          toast.success("تم تسجيل الخروج بنجاح");
          localStorage.setItem("lgd", "false");
          navigate("/login", { replace: true });
        },
      }
    );
  };

  return (
    <div>
      <Button
        className="w-full gap-2"
        variant="destructive"
        onClick={() => setIsLogoutDialogOpen(true)}
      >
        تسجيل الخروج
      </Button>
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-lg text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد تسجيل الخروج</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من تسجيل الخروج؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* <DialogCancel onClick={() => setIsLogoutDialogOpen(false)}>
              إلغاء
            </DialogCancel> */}
            <Button
              onClick={() => {
                setIsLogoutDialogOpen(false);
                handleLogout();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              تسجيل الخروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LogoutDialog;
