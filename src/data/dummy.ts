import { DISCOUNT_STATUS } from "@/utils/constants";




export const dmy_products = [
  {
    id: 1,
    title: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: 59.99,
    image: "/images/products/headphones.jpg",
    rate: 4.5,
    properties: {
      brand: "SoundMax",
      color: "Black",
      warranty: "1 year"
    }
  },
  {
    id: 2,
    title: "Smart Fitness Watch",
    description: "Waterproof fitness tracker with heart-rate monitor.",
    price: 79.99,
    image: "/images/products/fitness-watch.jpg",
    rate: 4.2,
    properties: {
      brand: "FitPulse",
      color: "Blue",
      warranty: "2 years"
    }
  },
  {
    id: 3,
    title: "USB-C Fast Charger",
    description: "Super-fast 30W USB-C wall charger.",
    price: 24.99,
    image: "/images/products/charger.jpg",
    rate: 4.7,
    properties: {
      brand: "ChargePro",
      color: "White",
      warranty: "6 months"
    }
  }
];


export const dmy_categories = [
  {
    id: 1,
    name: "الكترونيات",
    description: "الأجهزة الكترونية، الأجهزة الذكية، والإكسسوارات.",
    enabled: false,
    number_of_products: 14,
    image: "/images/categories/electronics.jpg"
  },
  {
    id: 2,
    name: "الموضة",
    description: "الملابس، الأحذية، والإكسسوارات.",
    enabled: true,
    number_of_products: 12,
    image: "/images/categories/fashion.jpg"
  },
  {
    id: 3,
    name: "المنزل والمطبخ",
    description: "الأثاث، الأجهزة المنزلية، والأدوات المنزلية.",
    enabled: true,
    number_of_products: 15,
    image: "/images/categories/home-kitchen.jpg"
  },
  {
    id: 4,
    name: "الرياضة واللياقة",
    description: "الملابس الرياضية، الأدوات الرياضية، والإكسسوارات.",
    enabled: false,
    number_of_products: 13,
    image: "/images/categories/sports-fitness.jpg"
  },
  {
    id: 5,
    name: "الجمال والرعاية الشخصية",
    description: "المواد الجمالية، المنتجات التجميلية، والإكسسوارات.",
    enabled: true,
    number_of_products: 11,
    image: "/images/categories/beauty.jpg"
  },
  {
    id: 6,
    name: "الألعاب والألعاب الأطفال",
    description: "الألعاب، الألعاب الشبابية، والألعاب الأطفال.",
    enabled: true,
    number_of_products: 12,
    image: "/images/categories/toys.jpg"
  },
  {
    id: 7,
    name: "السيارات",
    description: "الإكسسوارات السيارات، الأدوات السيارات، والأجزاء السيارات.",
    enabled: false,
    number_of_products: 13,
    image: "/images/categories/automotive.jpg"
  },
  {
    id: 8,
    name: "الكتب",
    description: "الكتب الخيالية، الكتب العلمية، الكتب التعليمية، والكتب الأخرى.",
    enabled: true,
    number_of_products: 14,
    image: "/images/categories/books.jpg"
  },
  {
    id: 9,
    name: "المواد الغذائية",
    description: "المواد الغذائية اليومية، المواد الغذائية المنزلية، والمواد الغذائية الأخرى.",
    enabled: true,
    number_of_products: 15,
    image: "/images/categories/groceries.jpg"
  },
  {
    id: 10,
    name: "الصحة والطب الطبيعي",
    description: "المكملات الغذائية، الأدوات الطبيعية، والأدوات الطبيعية الأخرى.",
    enabled: false,
    number_of_products: 16,
    image: "/images/categories/health.jpg"
  }
];

export const dmy_discounts = [
  {
    id: 4,
    name: "عرض الشتاء",
    description: "خصومات خاصة بموسم الشتاء",
    discount_percentage: 15,
    discount_start_date: "2025-12-15",
    discount_end_date: "2026-01-10",
    discount_status: DISCOUNT_STATUS.ACTIVE,
    discount_products: [dmy_products[0], dmy_products[1]],
    discount_categories: [dmy_categories[0], dmy_categories[3]],
    image: "/images/discounts/discount-2.jpg"
  },
  {
    id: 5,
    name: "عرض نهاية السنة",
    description: "خصومات نهاية سنة 2025",
    discount_percentage: 25,
    discount_start_date: "2025-12-20",
    discount_end_date: "2026-01-05",
    discount_status: DISCOUNT_STATUS.ACTIVE,
    discount_products: [dmy_products[1], dmy_products[2]],
    discount_categories: [dmy_categories[2], dmy_categories[4]],
    image: "/images/discounts/discount-3.jpg"
  },
  {
    id: 6,
    name: "عرض الجمعة البيضاء",
    description: "خصومات ضخمة بمناسبة الجمعة البيضاء",
    discount_percentage: 40,
    discount_start_date: "2025-11-20",
    discount_end_date: "2025-11-30",
    discount_status: DISCOUNT_STATUS.EXPIRED,
    discount_products: [dmy_products[0]],
    discount_categories: [dmy_categories[5]],
    image: "/images/discounts/discount-4.jpg"
  },
  {
    id: 7,
    name: "عرض رمضان",
    description: "خصومات خاصة بشهر رمضان",
    discount_percentage: 18,
    discount_start_date: "2025-02-25",
    discount_end_date: "2025-03-25",
    discount_status: DISCOUNT_STATUS.EXPIRED,
    discount_products: [dmy_products[2]],
    discount_categories: [dmy_categories[6]],
    image: "/images/discounts/discount-5.jpg"
  },
  {
    id: 8,
    name: "عرض الصيف",
    description: "تخفيضات على منتجات الصيف",
    discount_percentage: 12,
    discount_start_date: "2025-06-01",
    discount_end_date: "2025-06-30",
    discount_status: DISCOUNT_STATUS.EXPIRED,
    discount_products: [dmy_products[0], dmy_products[2]],
    discount_categories: [dmy_categories[1], dmy_categories[7]],
    image: "/images/discounts/discount-6.jpg"
  },
  {
    id: 9,
    name: "عرض العودة للمدارس",
    description: "خصومات لمنتجات العودة للمدارس",
    discount_percentage: 22,
    discount_start_date: "2025-09-01",
    discount_end_date: "2025-09-10",
    discount_status: DISCOUNT_STATUS.EXPIRED,
    discount_products: [dmy_products[1]],
    discount_categories: [dmy_categories[3], dmy_categories[8]],
    image: "/images/discounts/discount-7.jpg"
  },
  {
    id: 10,
    name: "عرض الربيع",
    description: "خصومات الربيع على المنتجات المختارة",
    discount_percentage: 17,
    discount_start_date: "2025-04-05",
    discount_end_date: "2025-04-20",
    discount_status: DISCOUNT_STATUS.EXPIRED,
    discount_products: [dmy_products[0], dmy_products[1], dmy_products[2]],
    discount_categories: [dmy_categories[0], dmy_categories[5]],
    image: "/images/discounts/discount-8.jpg"
  },
  {
    id: 11,
    name: "عرض VIP",
    description: "خصم خاص لعملاء الـ VIP",
    discount_percentage: 35,
    discount_start_date: "2025-12-01",
    discount_end_date: "2026-02-01",
    discount_status: DISCOUNT_STATUS.ACTIVE,
    discount_products: [dmy_products[2]],
    discount_categories: [dmy_categories[9]],
    image: "/images/discounts/discount-9.jpg"
  },
  {
    id: 12,
    name: "عرض نهاية الأسبوع",
    description: "خصومات كل نهاية أسبوع",
    discount_percentage: 8,
    discount_start_date: "2025-01-10",
    discount_end_date: "2025-01-12",
    discount_status: DISCOUNT_STATUS.EXPIRED,
    discount_products: [dmy_products[1], dmy_products[2]],
    discount_categories: [dmy_categories[1], dmy_categories[4]],
    image: "/images/discounts/discount-10.jpg"
  },
  {
    id: 13,
    name: "عرض العملاء الجدد",
    description: "خصم ترحيبي للعملاء الجدد",
    discount_percentage: 20,
    discount_start_date: "2025-12-01",
    discount_end_date: "2026-03-01",
    discount_status: DISCOUNT_STATUS.ACTIVE,
    discount_products: [dmy_products[0]],
    discount_categories: [dmy_categories[2], dmy_categories[6]],
    image: "/images/discounts/discount-11.jpg"
  }
];



export const dmy_orders = [
  {
    id: 1,
    products: [dmy_products[0], dmy_products[2]], // headphones + charger
    address: "Baghdad, Al Mansour Street",
    created_at: "2025-01-15T10:32:00Z",
    status: "pending",
    user_id: 1,
    note: "Please deliver between 4–6 PM."
  },
  {
    id: 2,
    products: [dmy_products[1]], // fitness watch
    address: "Basra, Al Jubaila",
    created_at: "2025-01-17T14:10:00Z",
    status: "shipped",
    user_id: 2,
    note: ""
  },
  {
    id: 3,
    products: [dmy_products[0], dmy_products[1], dmy_products[2]],
    address: "Erbil, English Village",
    created_at: "2025-01-20T09:48:00Z",
    status: "delivered",
    user_id: 3,
    note: "Leave at reception."
  },
{
    id: 4,
    products: [dmy_products[2]],
    address: "Najaf, Al Adala District",
    created_at: "2025-01-21T16:22:00Z",
    status: "pending",
    user_id: 4,
    note: ""
  },
  {
    id: 5,
    products: [dmy_products[1], dmy_products[2]],
    address: "Karbala, Bab Baghdad Area",
    created_at: "2025-01-22T11:05:00Z",
    status: "processing",
    user_id: 5,
    note: "Call before delivery."
  },
  {
    id: 6,
    products: [dmy_products[0]],
    address: "Baghdad, Palestine Street",
    created_at: "2025-01-23T09:17:00Z",
    status: "shipped",
    user_id: 6,
    note: ""
  },
  {
    id: 7,
    products: [dmy_products[0], dmy_products[1]],
    address: "Basra, Al Ashar District",
    created_at: "2025-01-24T18:44:00Z",
    status: "delivered",
    user_id: 7,
    note: "Leave with security guard."
  },
  {
    id: 8,
    products: [dmy_products[2]],
    address: "Mosul, Al Zahraa",
    created_at: "2025-01-25T13:29:00Z",
    status: "pending",
    user_id: 8,
    note: ""
  },
  {
    id: 9,
    products: [dmy_products[1]],
    address: "Sulaymaniyah, Chwarbakh",
    created_at: "2025-01-26T08:55:00Z",
    status: "processing",
    user_id: 9,
    note: "Ring the bell twice."
  },
  {
    id: 10,
    products: [dmy_products[0], dmy_products[2]],
    address: "Anbar, Ramadi Center",
    created_at: "2025-01-27T15:40:00Z",
    status: "shipped",
    user_id: 10,
    note: ""
  },
  {
    id: 11,
    products: [dmy_products[1], dmy_products[0]],
    address: "Kirkuk, Rahimawa",
    created_at: "2025-01-28T19:12:00Z",
    status: "pending",
    user_id: 11,
    note: "Customer prefers evening delivery."
  },
  {
    id: 12,
    products: [dmy_products[2]],
    address: "Dhi Qar, Al Nasiriyah City",
    created_at: "2025-01-29T10:07:00Z",
    status: "delivered",
    user_id: 12,
    note: ""
  },
  {
    id: 13,
    products: [dmy_products[0], dmy_products[1], dmy_products[2]],
    address: "Babylon, Hilla City",
    created_at: "2025-01-30T12:51:00Z",
    status: "processing",
    user_id: 13,
    note: "Urgent delivery requested."
  }
];


export const dmy_users = [
  {
    id: 1,
    name: "احمد محسن",
    phone: "+9647710000001",
    location: "البصرة, العراق"
  },
  {
    id: 2,
    name: "محمد علي",
    phone: "+9647710000002",
    location: "بغداد, العراق"
  },
  {
    id: 3,
    name: "سجاد وليد",
    phone: "+9647710000003",
    location: "اربيل, العراق"
  },
{
    id: 4,
    name: "كرار عباس",
    phone: "+9647710000004",
    location: "النجف, العراق"
  },
  {
    id: 5,
    name: "حسين قاسم",
    phone: "+9647710000005",
    location: "كربلاء, العراق"
  },
  {
    id: 6,
    name: "مصطفى جاسم",
    phone: "+9647710000006",
    location: "ذي قار, العراق"
  },
  {
    id: 7,
    name: "علي ستار",
    phone: "+9647710000007",
    location: "الديوانية, العراق"
  },
  {
    id: 8,
    name: "امير كريم",
    phone: "+9647710000008",
    location: "الحلة, العراق"
  },
  {
    id: 9,
    name: "مهدي رحيم",
    phone: "+9647710000009",
    location: "ديالى, العراق"
  },
  {
    id: 10,
    name: "زين العابدين فاضل",
    phone: "+9647710000010",
    location: "سامراء, العراق"
  },
  {
    id: 11,
    name: "حيدر سلمان",
    phone: "+9647710000011",
    location: "كركوك, العراق"
  },
  {
    id: 12,
    name: "جعفر يوسف",
    phone: "+9647710000012",
    location: "الموصل, العراق"
  },
  {
    id: 13,
    name: "مرتضى حسين",
    phone: "+9647710000013",
    location: "السماوة, العراق"
  }
];

export const dmy_employees = [
  {
    id: 1,
    name: "حيدر كاظم",
    role: "مدير عام",
    phone: "+9647701000001",
    email: "haider.kadim@example.com"
  },
  {
    id: 2,
    name: "سيف مهدي",
    role: "محاسب",
    phone: "+9647701000002",
    email: "saif.mahdi@example.com"
  },
  {
    id: 3,
    name: "مروان حسن",
    role: "مدير مبيعات",
    phone: "+9647701000003",
    email: "marwan.hassan@example.com"
  },
  {
    id: 4,
    name: "رغد جاسم",
    role: "موظف خدمة العملاء",
    phone: "+9647701000004",
    email: "raghad.jasim@example.com"
  },
  {
    id: 5,
    name: "زينب علي",
    role: "مصمم جرافيك",
    phone: "+9647701000005",
    email: "zainab.ali@example.com"
  },
  {
    id: 6,
    name: "عمر يوسف",
    role: "مطور ويب",
    phone: "+9647701000006",
    email: "omar.yousif@example.com"
  },
  {
    id: 7,
    name: "سارة كريم",
    role: "مديرة الموارد البشرية",
    phone: "+9647701000007",
    email: "sara.kareem@example.com"
  },
  {
    id: 8,
    name: "حسن مرتضى",
    role: "مخزّن",
    phone: "+9647701000008",
    email: "hassan.murtada@example.com"
  },
  {
    id: 9,
    name: "آية محمد",
    role: "مدققة بيانات",
    phone: "+9647701000009",
    email: "aya.mohammed@example.com"
  },
  {
    id: 10,
    name: "كرار فاضل",
    role: "سائق توصيل",
    phone: "+9647701000010",
    email: "karar.fadel@example.com"
  }
];



export const dmy_notifications = [
  {
    id: 1,
    title: "طلب جديد",
    message: "تم استلام طلب جديد من المستخدم رقم 12.",
    created_at: "2025-02-10T09:15:00Z",
    type: "order",
    read: false
  },
  {
    id: 2,
    title: "طلب في الطريق",
    message: "طلب رقم #102 تمت معالجته وهو الآن في الطريق.",
    created_at: "2025-02-11T14:22:00Z",
    type: "order_status",
    read: false
  },
  {
    id: 3,
    title: "خصم جديد",
    message: "تم إضافة خصم بنسبة 20% على قسم الإلكترونيات.",
    created_at: "2025-02-09T08:00:00Z",
    type: "discount",
    read: true
  },
  {
    id: 4,
    title: "عميل جديد",
    message: "تم تسجيل عميل جديد باسم محمد جاسم.",
    created_at: "2025-02-08T10:45:00Z",
    type: "user",
    read: true
  },
  {
    id: 5,
    title: "تم شحن الطلب",
    message: "تم شحن الطلب رقم #95 من المخزن.",
    created_at: "2025-02-06T17:10:00Z",
    type: "order_status",
    read: false
  },
  {
    id: 6,
    title: "نفاد منتج",
    message: "تم نفاد المخزون من المنتج: سماعات بلوتوث.",
    created_at: "2025-02-03T11:30:00Z",
    type: "inventory",
    read: true
  },
  {
    id: 7,
    title: "تم تحديث الأسعار",
    message: "تم تحديث أسعار بعض المنتجات في قسم الأجهزة الذكية.",
    created_at: "2025-02-01T09:00:00Z",
    type: "system",
    read: false
  },
  {
    id: 8,
    title: "موظف جديد",
    message: "انضم الموظف علي سلمان إلى فريق خدمة العملاء.",
    created_at: "2025-01-30T13:20:00Z",
    type: "employee",
    read: true
  },
  {
    id: 9,
    title: "مشكلة في الطلب",
    message: "هناك مشكلة في شحنة الطلب رقم #88. يرجى المتابعة.",
    created_at: "2025-01-29T07:55:00Z",
    type: "alert",
    read: false
  },
  {
    id: 10,
    title: "تم إضافة قسم جديد",
    message: "تم إضافة قسم جديد للتسوق: الأدوات المنزلية.",
    created_at: "2025-01-27T12:40:00Z",
    type: "system",
    read: true
  }
];


