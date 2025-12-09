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
  }
];


export const dmy_users = [
  {
    id: 1,
    name: "Mohammed Jameel",
    phone: "+9647710000001",
    location: "Baghdad, Iraq"
  },
  {
    id: 2,
    name: "Sara Ali",
    phone: "+9647710000002",
    location: "Basra, Iraq"
  },
  {
    id: 3,
    name: "Ahmed Yassin",
    phone: "+9647710000003",
    location: "Erbil, Iraq"
  }
];
