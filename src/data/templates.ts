export interface Template {
  id: string;
  name: string;
  category: 'restaurant' | 'ecommerce';
  description: string;
  preview: string;
  sections: TemplateSection[];
  features: string[];
  color: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  type: 'header' | 'hero' | 'menu' | 'products' | 'gallery' | 'contact' | 'footer';
  content: Record<string, any>;
  order: number;
}

export const templates: Template[] = [
  {
    id: 'restaurant-modern',
    name: 'Modern Restaurant',
    category: 'restaurant',
    description: 'Contemporary restaurant template with menu showcase and reservations',
    preview: 'A clean, modern design perfect for fine dining establishments',
    sections: [
      {
        id: 'header',
        name: 'Navigation Header',
        type: 'header',
        content: {
          logo: 'Restaurant Name',
          menuItems: ['Home', 'Menu', 'Reservations', 'About', 'Contact'],
          phoneNumber: '+1 234-567-8900'
        },
        order: 1
      },
      {
        id: 'hero',
        name: 'Hero Section',
        type: 'hero',
        content: {
          title: 'Welcome to Our Restaurant',
          subtitle: 'Experience culinary excellence',
          backgroundImage: '/restaurant-hero.jpg',
          ctaText: 'Make Reservation'
        },
        order: 2
      },
      {
        id: 'menu',
        name: 'Menu Section',
        type: 'menu',
        content: {
          categories: [
            {
              name: 'Appetizers',
              items: [
                { name: 'Bruschetta', price: '$12', description: 'Fresh tomatoes, basil, garlic' },
                { name: 'Calamari', price: '$15', description: 'Crispy fried squid rings' }
              ]
            },
            {
              name: 'Main Courses',
              items: [
                { name: 'Grilled Salmon', price: '$28', description: 'Atlantic salmon with vegetables' },
                { name: 'Ribeye Steak', price: '$35', description: '12oz cut with sides' }
              ]
            }
          ]
        },
        order: 3
      },
      {
        id: 'contact',
        name: 'Contact Section',
        type: 'contact',
        content: {
          address: '123 Main St, City, State',
          phone: '+1 234-567-8900',
          email: 'info@restaurant.com',
          hours: 'Mon-Sun: 11:00 AM - 10:00 PM'
        },
        order: 4
      }
    ],
    features: ['Online Reservations', 'Menu Display', 'Photo Gallery', 'Contact Form'],
    color: '#dc2626'
  },
  {
    id: 'restaurant-cozy',
    name: 'Cozy Bistro',
    category: 'restaurant',
    description: 'Warm, inviting template perfect for casual dining and cafes',
    preview: 'Rustic charm with modern functionality for intimate dining experiences',
    sections: [
      {
        id: 'header',
        name: 'Navigation Header',
        type: 'header',
        content: {
          logo: 'Cozy Bistro',
          menuItems: ['Home', 'Menu', 'Events', 'Gallery', 'Contact'],
          phoneNumber: '+1 234-567-8901'
        },
        order: 1
      },
      {
        id: 'hero',
        name: 'Hero Section',
        type: 'hero',
        content: {
          title: 'Your Neighborhood Bistro',
          subtitle: 'Where every meal feels like home',
          backgroundImage: '/bistro-hero.jpg',
          ctaText: 'View Menu'
        },
        order: 2
      },
      {
        id: 'menu',
        name: 'Menu Section',
        type: 'menu',
        content: {
          categories: [
            {
              name: 'Breakfast',
              items: [
                { name: 'Pancakes', price: '$10', description: 'Fluffy stack with maple syrup' },
                { name: 'Omelette', price: '$12', description: 'Three eggs with fillings' }
              ]
            },
            {
              name: 'Lunch',
              items: [
                { name: 'Club Sandwich', price: '$14', description: 'Triple decker classic' },
                { name: 'Soup of Day', price: '$8', description: 'Fresh daily selection' }
              ]
            }
          ]
        },
        order: 3
      }
    ],
    features: ['Daily Specials', 'Event Hosting', 'Catering', 'Gift Cards'],
    color: '#ea580c'
  },
  {
    id: 'ecommerce-modern',
    name: 'Modern Store',
    category: 'ecommerce',
    description: 'Clean, professional e-commerce template with product focus',
    preview: 'Sleek design optimized for product showcase and conversions',
    sections: [
      {
        id: 'header',
        name: 'Navigation Header',
        type: 'header',
        content: {
          logo: 'Modern Store',
          menuItems: ['Home', 'Products', 'Categories', 'Deals', 'Contact'],
          cartCount: 0
        },
        order: 1
      },
      {
        id: 'hero',
        name: 'Hero Section',
        type: 'hero',
        content: {
          title: 'Summer Collection 2024',
          subtitle: 'Discover our latest products',
          backgroundImage: '/store-hero.jpg',
          ctaText: 'Shop Now'
        },
        order: 2
      },
      {
        id: 'products',
        name: 'Featured Products',
        type: 'products',
        content: {
          products: [
            {
              id: 1,
              name: 'Premium Headphones',
              price: '$299',
              image: '/headphones.jpg',
              description: 'High-quality audio experience'
            },
            {
              id: 2,
              name: 'Smart Watch',
              price: '$399',
              image: '/watch.jpg',
              description: 'Track your fitness and stay connected'
            },
            {
              id: 3,
              name: 'Laptop Stand',
              price: '$49',
              image: '/stand.jpg',
              description: 'Ergonomic aluminum design'
            },
            {
              id: 4,
              name: 'Wireless Mouse',
              price: '$79',
              image: '/mouse.jpg',
              description: 'Precision tracking and comfort'
            }
          ]
        },
        order: 3
      }
    ],
    features: ['Product Catalog', 'Shopping Cart', 'Checkout', 'Order Tracking'],
    color: '#2563eb'
  },
  {
    id: 'ecommerce-boutique',
    name: 'Boutique Store',
    category: 'ecommerce',
    description: 'Elegant template for fashion and specialty retail stores',
    preview: 'Sophisticated design for premium shopping experiences',
    sections: [
      {
        id: 'header',
        name: 'Navigation Header',
        type: 'header',
        content: {
          logo: 'Boutique',
          menuItems: ['New Arrivals', 'Collections', 'Sale', 'About', 'Contact'],
          cartCount: 0
        },
        order: 1
      },
      {
        id: 'hero',
        name: 'Hero Section',
        type: 'hero',
        content: {
          title: 'Curated Fashion',
          subtitle: 'Discover your unique style',
          backgroundImage: '/fashion-hero.jpg',
          ctaText: 'Explore Collection'
        },
        order: 2
      },
      {
        id: 'products',
        name: 'Featured Products',
        type: 'products',
        content: {
          products: [
            {
              id: 1,
              name: 'Designer Dress',
              price: '$450',
              image: '/dress.jpg',
              description: 'Elegant evening wear'
            },
            {
              id: 2,
              name: 'Leather Handbag',
              price: '$280',
              image: '/handbag.jpg',
              description: 'Genuine leather craftsmanship'
            },
            {
              id: 3,
              name: 'Silk Scarf',
              price: '$120',
              image: '/scarf.jpg',
              description: 'Luxurious accessory'
            },
            {
              id: 4,
              name: 'Designer Shoes',
              price: '$380',
              image: '/shoes.jpg',
              description: 'Comfort meets style'
            }
          ]
        },
        order: 3
      }
    ],
    features: ['Size Guide', 'Wishlist', 'Style Quiz', 'Personal Stylist'],
    color: '#7c3aed'
  }
];
