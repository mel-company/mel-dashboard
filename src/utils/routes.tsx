import React from "react";
import { Route } from "react-router-dom";
import Home from "../pages/home/Home";
import Stats from "../pages/stats/Stats";
import Products from "../new-pages/products";
import Orders from "../new-pages/orders";
import ProductDetails from "../pages/product/ProductDetails";
import Customers from "../new-pages/customers";
import CustomerDetails from "../pages/customer/CustomerDetails";
import OrderDetails from "../pages/order/OrderDetails";
import Employees from "../new-pages/employees";
import EmployeeDetails from "../pages/employee/EmployeeDetails";
import AddProduct from "../pages/product/AddProduct";
import Categories from "../new-pages/categories";
import CategoryDetails from "../pages/category/CategoryDetails";
import AddCategory from "../pages/category/AddCategory";
import AddEmployee from "../pages/employee/AddEmployee";
import AddCustomer from "../pages/customer/AddCustomer";
import AddOrder from "../pages/order/AddOrder";
import Discounts from "../new-pages/discounts";
import DiscountDetails from "../pages/discount/DiscountDetails";
import AddDiscount from "../pages/discount/AddDiscount";
import Notifications from "../new-pages/notifications";
import NotificationDetails from "../pages/notification/NotificationDetails";
import UserProfile from "../pages/profile/UserProfile";
import SettingsPage from "../new-pages/settings";
import OTP from "../pages/auth/OTP";
import AppStore from "../pages/app-store/AppStore";
import Accounting from "../pages/accounting/Accounting";
import StoreLogin from "../pages/auth/StoreLogin";
import EditProduct from "../pages/product/EditProduct";
import EditCategory from "../pages/category/EditCategory";
import EditDiscount from "../pages/discount/EditDiscount";
import CategorieGroups from "../pages/category/category-group/CategorieGroups";
import CategoryGroupDetails from "../pages/category/category-group/CategoryGroupDetails";
import EditCategoryGroup from "../pages/category/category-group/EditCategoryGroup";
import Plans from "../pages/plan/Plans";
import POS from "../new-pages/pos";
import Coupons from "../pages/coupone/Coupons";
import CouponDetails from "../pages/coupone/CouponDetails";
import EditCoupon from "../pages/coupone/EditCoupon";
import AddCoupon from "../pages/coupone/AddCoupon";
import Tickets from "../new-pages/tickets";
import TicketDetails from "../new-pages/tickets/details";
import CreateTicket from "../new-pages/tickets/create";
import DevStoreLogin from "../pages/auth/DevStoreLogin";
import DevOTP from "../pages/auth/DEVOTP";
import PrimeTestPage from "../pages/prime/PrimeTestPage";

export interface RouteConfig {
    path: string;
    element?: React.ReactElement;
    children?: RouteConfig[];
}

export const mainRoutes: RouteConfig[] = [
    { path: "/", element: <Home /> },
    { path: "/stats", element: <Stats /> },
    { path: "/plans", element: <Plans /> },
    { path: "/app-store", element: <AppStore /> },
    { path: "/accounting", element: <Accounting /> },
    { path: "/pos", element: <POS /> },
    { path: "/prime-test", element: <PrimeTestPage /> },
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
            { path: "new", element: <CreateTicket /> },
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

export const settingsRoutes: RouteConfig[] = [
    { path: "general", element: <SettingsPage /> },
    { path: "store", element: <SettingsPage /> },
];

export const publicRoutes: RouteConfig[] = [
    { path: "/login", element: <StoreLogin /> },
    { path: "/dev-login", element: <DevStoreLogin /> },
    { path: "/dev-otp", element: <DevOTP /> },
    { path: "/otp", element: <OTP /> },
];

export const renderRoute = (route: RouteConfig, index: number) => {
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