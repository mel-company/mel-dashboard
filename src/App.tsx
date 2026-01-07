import "./App.css";
import Layout from "./layout/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/home/Home";
import Stats from "./pages/stats/Stats";
import Products from "./pages/product/Products";
import Orders from "./pages/order/Orders";
import ProductDetails from "./pages/product/ProductDetails";
import Customers from "./pages/customer/Customers";
import CustomerDetails from "./pages/customer/CustomerDetails";
import OrderDetails from "./pages/order/OrderDetails";
import Employees from "./pages/employee/Employees";
import EmployeeDetails from "./pages/employee/EmployeeDetails";
import AddProduct from "./pages/product/AddProduct";
import Categories from "./pages/category/Categories";
import CategoryDetails from "./pages/category/CategoryDetails";
import AddCategory from "./pages/category/AddCategory";
import AddEmployee from "./pages/employee/AddEmployee";
import AddCustomer from "./pages/customer/AddCustomer";
import AddOrder from "./pages/order/AddOrder";
import Discounts from "./pages/discount/Discounts";
import DiscountDetails from "./pages/discount/DiscountDetails";
import AddDiscount from "./pages/discount/AddDiscount";
import Notifications from "./pages/notification/Notifications";
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
import SubscriptionSettings from "./pages/settings/SubscriptionSettings";
import Plans from "./pages/plan/Plans";
import Payment from "./pages/payment/Payment";
import POS from "./pages/pos/POS";
import PrivacyPolicySettings from "./pages/settings/PrivacyPolicySettings";
import RefundPolicySettings from "./pages/settings/RefundPolicySettings";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/stats" element={<Stats />} />

            {/* products routes */}
            <Route path="/products">
              <Route index element={<Products />} />
              <Route path=":id">
                <Route index element={<ProductDetails />} />
                <Route path="edit" element={<EditProduct />} />
              </Route>
              <Route path="add" element={<AddProduct />} />
            </Route>

            {/* customers routes */}
            <Route path="/customers">
              <Route index element={<Customers />} />
              <Route path=":id" element={<CustomerDetails />} />
              <Route path="add" element={<AddCustomer />} />
            </Route>

            {/* orders routes */}
            <Route path="/orders">
              <Route index element={<Orders />} />
              <Route path=":id" element={<OrderDetails />} />
              <Route path="add" element={<AddOrder />} />
            </Route>

            {/* employees routes */}
            <Route path="/employees">
              <Route index element={<Employees />} />
              <Route path=":id" element={<EmployeeDetails />} />
              <Route path="add" element={<AddEmployee />} />
            </Route>

            {/* notifications routes */}
            <Route path="/notifications">
              <Route index element={<Notifications />} />
              <Route path=":id" element={<NotificationDetails />} />
            </Route>

            {/* profile routes */}
            <Route path="/profile">
              <Route index element={<UserProfile />} />
            </Route>

            {/* settings routes */}
            <Route path="/settings" element={<SettingsLayout />}>
              <Route
                index
                element={<Navigate to="/settings/general" replace />}
              />
              <Route path="general" element={<GeneralSettings />} />
              <Route path="store" element={<DetailsSettings />} />
              <Route path="domain" element={<DomainSettings />} />
              <Route
                path="payment-methods"
                element={<PaymentMethodsSettings />}
              />
              <Route path="delivery" element={<DeliverySettings />} />
              <Route path="policies">
                <Route
                  index
                  path="terms-and-conditions"
                  element={<TermsAndConditionsSettings />}
                />
                <Route
                  path="privacy-policy"
                  element={<PrivacyPolicySettings />}
                />
                <Route
                  path="refund-policy"
                  element={<RefundPolicySettings />}
                />
              </Route>
              <Route path="subscription" element={<SubscriptionSettings />} />
            </Route>

            <Route path="/plans" element={<Plans />} />
            <Route path="/payment/:planId" element={<Payment />} />

            {/* category routes */}
            <Route path="/categories">
              <Route index element={<Categories />} />
              <Route path=":id">
                <Route index element={<CategoryDetails />} />
                <Route path="edit" element={<EditCategory />} />
              </Route>
              <Route path="add" element={<AddCategory />} />
            </Route>

            {/* Discounts routes */}
            <Route path="/discounts">
              <Route index element={<Discounts />} />
              <Route path=":id">
                <Route index element={<DiscountDetails />} />
                <Route path="edit" element={<EditDiscount />} />
              </Route>
              <Route path="add" element={<AddDiscount />} />
            </Route>

            {/* App Store route */}
            <Route path="/app-store" element={<AppStore />} />

            {/* Accounting route */}
            <Route path="/accounting" element={<Accounting />} />

            {/* POS route */}
            <Route path="/pos" element={<POS />} />
          </Route>
        </Route>
        {/* Public routes */}
        <Route path="/login" element={<StoreLogin />} />
        {/* <Route path="/store-login" element={<StoreLogin />} /> */}
        <Route path="/otp" element={<OTP />} />

        {/* Protected routes - Dashboard with Layout */}
        {/* <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Stats />} />

          <Route path="/products">
            <Route index element={<Products />} />
            <Route path=":id" element={<ProductDetails />} />
            <Route path="add" element={<AddProduct />} />
          </Route>

          <Route path="/customers">
            <Route index element={<Customers />} />
            <Route path=":id" element={<CustomerDetails />} />
            <Route path="add" element={<AddCustomer />} />
          </Route>

          <Route path="/orders">
            <Route index element={<Orders />} />
            <Route path=":id" element={<OrderDetails />} />
            <Route path="add" element={<AddOrder />} />
          </Route>

          <Route path="/employees">
            <Route index element={<Employees />} />
            <Route path=":id" element={<EmployeeDetails />} />
            <Route path="add" element={<AddEmployee />} />
          </Route>

          <Route path="/notifications">
            <Route index element={<Notifications />} />
            <Route path=":id" element={<NotificationDetails />} />
          </Route>

          <Route path="/profile">
            <Route index element={<UserProfile />} />
          </Route>

          <Route path="/settings" element={<SettingsLayout />}>
            <Route
              index
              element={<Navigate to="/settings/general" replace />}
            />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="store" element={<DetailsSettings />} />
            <Route path="domain" element={<DomainSettings />} />
            <Route
              path="payment-methods"
              element={<PaymentMethodsSettings />}
            />
            <Route path="delivery" element={<DeliverySettings />} />
            <Route
              path="terms-and-conditions"
              element={<TermsAndConditionsSettings />}
            />
          </Route>

          <Route path="/categories">
            <Route index element={<Categories />} />
            <Route path=":id" element={<CategoryDetails />} />
            <Route path="add" element={<AddCategory />} />
          </Route>

          <Route path="/discounts">
            <Route index element={<Discounts />} />
            <Route path=":id" element={<DiscountDetails />} />
            <Route path="add" element={<AddDiscount />} />
          </Route>

          <Route path="/app-store" element={<AppStore />} />

          <Route path="/accounting" element={<Accounting />} />
        </Route> */}

        {/* Root redirect */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

export default App;
