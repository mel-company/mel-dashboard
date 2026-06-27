import { type IconSvgElement } from '@hugeicons/react';

import {
    Home12Icon as Home12IconNormal,
    Package02Icon as Package02IconNormal,
    GridViewIcon as GridViewIconNormal,
    Coupon02Icon as Coupon02IconNormal,
    CustomerSupportIcon as CustomerSupportIconNormal,
    ShippingLoadingIcon as ShippingLoadingIconNormal,
    ShoppingBasket03Icon as ShoppingBasket03IconNormal,
    UserGroup03Icon as UserGroup03IconNormal,
    UserMultiple03Icon as UserMultiple03IconNormal,
    Settings01Icon as Settings01IconNormal
} from '@hugeicons-pro/core-stroke-rounded';

import {
    Home12Icon as Home12IconActive,
    Package02Icon as Package02IconActive,
    GridViewIcon as GridViewIconActive,
    Coupon02Icon as Coupon02IconActive,
    CustomerSupportIcon as CustomerSupportIconActive,
    ShippingLoadingIcon as ShippingLoadingIconActive,
    ShoppingBasket03Icon as ShoppingBasket03IconActive,
    UserGroup03Icon as UserGroup03IconActive,
    UserMultiple03Icon as UserMultiple03IconActive,
    Settings01Icon as Settings01IconActive
} from '@hugeicons-pro/core-solid-rounded';


export type PageType = {
    label: string;
    slug: string;
    apiEndpoint: string;
    group: string;
    icon: {
        normal: IconSvgElement;
        active: IconSvgElement;
    };
}

export const pages: PageType[] = [{
    label: "الرئيسية",
    slug: "",
    apiEndpoint: "",
    group: "معلومات النظام",
    icon: {
        normal: Home12IconNormal,
        active: Home12IconActive
    },
},
{
    label: "المنتجات",
    slug: "/products",
    apiEndpoint: "product/filter-cursor",
    group: "إدارة المتجر",
    icon: {
        normal: Package02IconNormal,
        active: Package02IconActive
    },
}, {
    label: "الفئات",
    slug: "/categories",
    apiEndpoint: "category/filter-cursor",
    group: "إدارة المتجر",
    icon: {
        normal: GridViewIconNormal,
        active: GridViewIconActive
    },
},
{
    label: "الخصومات والكوبونات",
    slug: "/discounts",
    apiEndpoint: "discount/filter-cursor",
    group: "إدارة المتجر",
    icon: {
        normal: Coupon02IconNormal,
        active: Coupon02IconActive
    },
},
{
    label: "الدعم",
    slug: "/tickets",
    apiEndpoint: "support-ticket/store/filter-cursor",
    group: "الحركة والمبيعات",
    icon: {
        normal: CustomerSupportIconNormal,
        active: CustomerSupportIconActive
    },
},
{
    label: "الطلبات",
    slug: "/orders",
    apiEndpoint: "order/filter-cursor",
    group: "الحركة والمبيعات",
    icon: {
        normal: ShippingLoadingIconNormal,
        active: ShippingLoadingIconActive
    },
},
{
    label: "نقطة البيع",
    slug: "/pos",
    apiEndpoint: "pos",
    group: "الحركة والمبيعات",
    icon: {
        normal: ShoppingBasket03IconNormal,
        active: ShoppingBasket03IconActive
    },
},
{
    label: "العملاء",
    slug: "/customers",
    apiEndpoint: "customer/cursor",
    group: "الحركة والمبيعات",
    icon: {
        normal: UserGroup03IconNormal,
        active: UserGroup03IconActive
    },
},
{
    label: "الموظفين",
    slug: "/employees",
    apiEndpoint: "employee",
    group: "ادارة",
    icon: {
        normal: UserMultiple03IconNormal,
        active: UserMultiple03IconActive
    },
},
{
    label: "الاعدادات",
    slug: "/settings",
    apiEndpoint: "settings",
    group: "ادارة",
    icon: {
        normal: Settings01IconNormal,
        active: Settings01IconActive
    },
}]


