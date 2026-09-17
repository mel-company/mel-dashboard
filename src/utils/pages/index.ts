import { type IconSvgElement } from '@hugeicons/react';

import {
    Home12Icon as Home12IconNormal,
    Package02Icon as Package02IconNormal,
    GridViewIcon as GridViewIconNormal,
    Layers01Icon as Layers01IconNormal,
    Coupon02Icon as Coupon02IconNormal,
    CustomerSupportIcon as CustomerSupportIconNormal,
    ShippingLoadingIcon as ShippingLoadingIconNormal,
    ShoppingBasket03Icon as ShoppingBasket03IconNormal,
    UserGroup03Icon as UserGroup03IconNormal,
    UserMultiple03Icon as UserMultiple03IconNormal,
    Settings01Icon as Settings01IconNormal,
    Notification01Icon as Notification01IconNormal,
} from '@hugeicons-pro/core-stroke-rounded';

import {
    Home12Icon as Home12IconActive,
    Package02Icon as Package02IconActive,
    GridViewIcon as GridViewIconActive,
    Layers01Icon as Layers01IconActive,
    Coupon02Icon as Coupon02IconActive,
    CustomerSupportIcon as CustomerSupportIconActive,
    ShippingLoadingIcon as ShippingLoadingIconActive,
    ShoppingBasket03Icon as ShoppingBasket03IconActive,
    UserGroup03Icon as UserGroup03IconActive,
    UserMultiple03Icon as UserMultiple03IconActive,
    Settings01Icon as Settings01IconActive,
    Notification01Icon as Notification01IconActive,
} from '@hugeicons-pro/core-solid-rounded';


export type PageType = {
    label: string;
    slug: string;
    apiEndpoint: string;
    searchApiEndpoint?: string;
    group: string;
    requiresPhysicalStore?: boolean;
    icon: {
        normal: IconSvgElement;
        active: IconSvgElement;
    };
}

export const pages: PageType[] = [{
    label: "لوحة التحكم",
    slug: "",
    apiEndpoint: "",
    group: "معلومات النظام",
    icon: {
        normal: Home12IconNormal,
        active: Home12IconActive
    },
},
{
    label: "الاشعارات",
    slug: "/notifications",
    apiEndpoint: "notification/cursor",
    searchApiEndpoint: "notification/search-cursor",
    group: "معلومات النظام",
    icon: {
        normal: Notification01IconNormal,
        active: Notification01IconActive
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
    // A collection is the merchant's own curated set — "صيفي", "شتوي" — as
    // opposed to a category, which is a taxonomy. Directly under the
    // categories because the two are the store's browse axes.
    //
    // This entry is not optional decoration: `useTableData` reads
    // `usePage().currentPage.apiEndpoint` off this list, so without it the
    // list page's query never runs.
    label: "المجموعات",
    slug: "/collections",
    apiEndpoint: "collection/filter-cursor",
    group: "إدارة المتجر",
    icon: {
        normal: Layers01IconNormal,
        active: Layers01IconActive
    },
},
{
    label: "الخصومات والكوبونات",
    slug: "/discounts",
    apiEndpoint: "discount/filter-cursor",
    searchApiEndpoint: "discount/search-cursor",
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
    searchApiEndpoint: "support-ticket/store/search-cursor",
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
    requiresPhysicalStore: true,
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


