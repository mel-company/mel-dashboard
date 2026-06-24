import "./App.css";
import Layout from "./layout/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/home/Home";
import Stats from "./pages/stats/Stats";
import Products from "./new-pages/products";
import Orders from "./new-pages/orders";
import ProductDetails from "./pages/product/ProductDetails";
import Customers from "./new-pages/customers";
import CustomerDetails from "./pages/customer/CustomerDetails";
import OrderDetails from "./pages/order/OrderDetails";
import OrderInvoicePreview from "./pages/order/OrderInvoicePreview";
import Employees from "./new-pages/employees";
import EmployeeDetails from "./pages/employee/EmployeeDetails";
import AddProduct from "./pages/product/AddProduct";
import Categories from "./new-pages/categories";
import CategoryDetails from "./pages/category/CategoryDetails";
import AddCategory from "./pages/category/AddCategory";
import AddEmployee from "./pages/employee/AddEmployee";
import AddCustomer from "./pages/customer/AddCustomer";
import AddOrder from "./pages/order/AddOrder";
import Discounts from "./new-pages/discounts";
import DiscountDetails from "./pages/discount/DiscountDetails";
import AddDiscount from "./pages/discount/AddDiscount";
import Notifications from "./new-pages/notifications";
import NotificationDetails from "./pages/notification/NotificationDetails";
import UserProfile from "./pages/profile/UserProfile";
// import Settings from "./pages/settings/Settings";
import GeneralSettings from "./pages/settings/GeneralSettings";
import DetailsSettings from "./pages/settings/DetailsSettings";
import DomainSettings from "./pages/settings/DomainSettings";
import PaymentMethodsSettings from "./pages/settings/PaymentMethodsSettings";
import DeliverySettings from "./pages/settings/DeliverySettings";
import TermsAndConditionsSettings from "./pages/settings/TermsAndConditionsSettings";
import OTP from "./pages/auth/OTP";
import SettingsLayout from "./layout/SettingsLayout";
import AppStore from "./pages/app-store/AppStore";
import Accounting from "./pages/accounting/Accounting";
import StoreLogin from "./pages/auth/StoreLogin";
import PrivateRoute from "./pages/RBAC/PrivateRoute";
import NotFoundPage from "./pages/miscellaneous/NotFoundPage";
import EditProduct from "./pages/product/EditProduct";
import EditCategory from "./pages/category/EditCategory";
import EditDiscount from "./pages/discount/EditDiscount";
import CategorieGroups from "./pages/category/category-group/CategorieGroups";
import CategoryGroupDetails from "./pages/category/category-group/CategoryGroupDetails";
import EditCategoryGroup from "./pages/category/category-group/EditCategoryGroup";
import SubscriptionSettings from "./pages/settings/SubscriptionSettings";
import Plans from "./pages/plan/Plans";
import Payment from "./pages/payment/Payment";
import POS from "./pages/pos/POS";
import PrivacyPolicySettings from "./pages/settings/PrivacyPolicySettings";
import RefundPolicySettings from "./pages/settings/RefundPolicySettings";
import { useConsumeBridge, useRefresh } from "./api/wrappers/auth.wrappers";
import { useEffect } from "react";
import Editor from "./pages/settings/Editor";
import Coupons from "./pages/coupone/Coupons";
import CouponDetails from "./pages/coupone/CouponDetails";
import EditCoupon from "./pages/coupone/EditCoupon";
import AddCoupon from "./pages/coupone/AddCoupon";
import Tickets from "./new-pages/tickets";
import TicketDetails from "./pages/support/TicketDetails";
import OpenTicket from "./pages/support/OpenTicket";
import Shortcuts from "./pages/settings/Shortcuts";
import DevStoreLogin from "./pages/auth/DevStoreLogin";
import DevOTP from "./pages/auth/DEVOTP";
import WebsiteSettings from "./pages/settings/WebsiteSettings";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />;
}

function Bridge() {
  const { mutate: consumeBridge } = useConsumeBridge();

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (token) {
      consumeBridge(
        { token },
        {
          onSuccess: (data: any) => {
            console.log("data", data);
            window.location.href = "/";
          },
          onError: (error) => {
            console.error(error);
          },
        },
      );
    }
  }, [token]);

  return <div>Bridge</div>;
}

interface RouteConfig {
  path: string;
  element?: React.ReactElement;
  children?: RouteConfig[];
}

function App() {
  // @ts-ignore
  const {
    // @ts-ignore
    data: refreshData,
    // @ts-ignore
    isLoading: isRefreshing,
    // @ts-ignore
    error: refreshError,
    // @ts-ignore
    refetch: refreshRefetch,
  } = useRefresh();

  useEffect(() => {
    if (refreshData) {
      refreshRefetch();
    }
  }, [refreshData]);

  const mainRoutes: RouteConfig[] = [
    { path: "/", element: <Home /> },
    { path: "/stats", element: <Stats /> },
    { path: "/plans", element: <Plans /> },
    { path: "/app-store", element: <AppStore /> },
    { path: "/accounting", element: <Accounting /> },
    { path: "/pos", element: <POS /> },
    {
      path: "/products",
      children: [
        { path: "", element: <Products /> },
        {
          path: ":id",
          children: [
            { path: "", element: <ProductDetails /> },
            { path: "edit", element: <EditProduct /> },
          ],
        },
        { path: "add", element: <AddProduct /> },
      ],
    },
    {
      path: "/tickets",
      children: [
        { path: "", element: <Tickets /> },
        {
          path: ":id",
          children: [{ path: "", element: <TicketDetails /> }],
        },
        { path: "new", element: <OpenTicket /> },
      ],
    },
    {
      path: "/customers",
      children: [
        { path: "", element: <Customers /> },
        { path: ":id", element: <CustomerDetails /> },
        { path: "add", element: <AddCustomer /> },
      ],
    },
    {
      path: "/orders",
      children: [
        { path: "", element: <Orders /> },
        { path: ":id", element: <OrderDetails /> },
        { path: "add", element: <AddOrder /> },
      ],
    },
    {
      path: "/employees",
      children: [
        { path: "", element: <Employees /> },
        { path: ":id", element: <EmployeeDetails /> },
        { path: "add", element: <AddEmployee /> },
      ],
    },
    {
      path: "/notifications",
      children: [
        { path: "", element: <Notifications /> },
        { path: ":id", element: <NotificationDetails /> },
      ],
    },
    {
      path: "/profile",
      children: [{ path: "", element: <UserProfile /> }],
    },
    {
      path: "/categories",
      children: [
        { path: "", element: <Categories /> },
        {
          path: ":id",
          children: [
            { path: "", element: <CategoryDetails /> },
            { path: "edit", element: <EditCategory /> },
          ],
        },
        { path: "add", element: <AddCategory /> },
      ],
    },
    {
      path: "/category-group",
      children: [
        { path: "", element: <CategorieGroups /> },
        {
          path: ":id",
          children: [
            { path: "", element: <CategoryGroupDetails /> },
            { path: "edit", element: <EditCategoryGroup /> },
          ],
        },
      ],
    },
    {
      path: "/discounts",
      children: [
        { path: "", element: <Discounts /> },
        {
          path: ":id",
          children: [
            { path: "", element: <DiscountDetails /> },
            { path: "edit", element: <EditDiscount /> },
          ],
        },
        { path: "add", element: <AddDiscount /> },
      ],
    },
    {
      path: "/coupons",
      children: [
        { path: "", element: <Coupons /> },
        {
          path: ":id",
          children: [
            { path: "", element: <CouponDetails /> },
            { path: "edit", element: <EditCoupon /> },
          ],
        },
        { path: "add", element: <AddCoupon /> },
      ],
    },
  ];

  const settingsRoutes: RouteConfig[] = [
    { path: "general", element: <GeneralSettings /> },
    { path: "editor", element: <Editor /> },
    { path: "website", element: <WebsiteSettings /> },
    { path: "store", element: <DetailsSettings /> },
    { path: "domain", element: <DomainSettings /> },
    { path: "payment-methods", element: <PaymentMethodsSettings /> },
    { path: "delivery", element: <DeliverySettings /> },
    {
      path: "policies",
      children: [
        {
          path: "terms-and-conditions",
          element: <TermsAndConditionsSettings />,
        },
        { path: "privacy-policy", element: <PrivacyPolicySettings /> },
        { path: "refund-policy", element: <RefundPolicySettings /> },
      ],
    },
    { path: "subscription", element: <SubscriptionSettings /> },
    { path: "shortcuts", element: <Shortcuts /> },
  ];

  const publicRoutes: RouteConfig[] = [
    { path: "/login", element: <StoreLogin /> },
    { path: "/dev-login", element: <DevStoreLogin /> },
    { path: "/dev-otp", element: <DevOTP /> },
    { path: "/otp", element: <OTP /> },
  ];

  const renderRoute = (route: RouteConfig, index: number) => {
    if (route.children) {
      return (
        <Route key={index} path={route.path}>
          {route.children.map((child, childIndex) =>
            renderRoute(child, childIndex)
          )}
        </Route>
      );
    }
    return (
      <Route
        key={index}
        path={route.path}
        element={route.element}
      />
    );
  };

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/bridge" element={<Bridge />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {mainRoutes.map((route, index) => renderRoute(route, index))}

            <Route path="/settings" element={<SettingsLayout />}>
              {settingsRoutes.map((route, index) => renderRoute(route, index))}
            </Route>

            <Route path="/payment/:planId" element={<Payment />} />
          </Route>
          <Route
            path="/order-invoice-preview"
            element={<OrderInvoicePreview />}
          />
        </Route>

        {publicRoutes.map((route, index) => renderRoute(route, index))}

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

export default App;
