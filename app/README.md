# Social Commerce Platform

A modern, real-time social commerce dashboard built with React, TypeScript, and Tailwind CSS. This application demonstrates a comprehensive e-commerce platform with live user activity tracking, inventory management, and a beautiful responsive UI.

## 🚀 Features

### **Dashboard Analytics**
- **Real-time Metrics**: Live tracking of views, sales, active users, and revenue
- **Live Activity Stream**: Real-time user events with visual indicators
- **Product Catalog**: Interactive product grid with stock management
- **Responsive Design**: Beautiful UI that works on all devices

### **Shopping Cart System**
- **Add/Remove Items**: Seamless cart management with quantity controls
- **Real-time Updates**: Live inventory tracking and stock alerts
- **Checkout Process**: Complete checkout flow with total calculations

### **Live Notifications**
- **Purchase Alerts**: Real-time notifications for new purchases
- **Low Stock Warnings**: Automatic alerts when inventory is running low
- **Event Tracking**: Comprehensive user activity monitoring

### **Modern UI/UX**
- **Gradient Design**: Beautiful gradient backgrounds and modern styling
- **Smooth Animations**: Hover effects and transitions throughout
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: Clean, professional appearance

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Hooks
- **Real-time Events**: Custom Kafka simulation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation and notifications
│   ├── Navigation.tsx  # Tab navigation
│   ├── Dashboard.tsx   # Main dashboard view
│   └── Cart.tsx        # Shopping cart functionality
├── hooks/              # Custom React hooks
│   └── useKafkaEventStream.ts  # Real-time event simulation
├── data/               # Data management
│   └── sampleData.ts   # Sample product data
├── types/              # TypeScript type definitions
│   └── index.ts        # All application types
└── SocialCommercePlatform.tsx  # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🎯 Key Features Explained

### **Real-time Event Simulation**
The app simulates a Kafka event stream that generates:
- User interactions (views, clicks, purchases)
- Inventory updates
- Live notifications
- Stock alerts

### **Component Architecture**
- **Modular Design**: Each feature is separated into its own component
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Reusable Hooks**: Custom hooks for data management and real-time events

### **Responsive Design**
- **Mobile-first**: Optimized for all screen sizes
- **Modern UI**: Gradient backgrounds, shadows, and smooth animations
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 📊 Dashboard Features

### **Metrics Overview**
- **Total Views**: Aggregate product view counts
- **Total Sales**: Number of completed purchases
- **Active Users**: Real-time user count
- **Revenue**: Calculated from sales data

### **Live Activity Feed**
- **Event Types**: View, click, purchase, add to cart, wishlist
- **Real-time Updates**: Events appear as they happen
- **Visual Indicators**: Color-coded event types

### **Product Management**
- **Stock Tracking**: Real-time inventory levels
- **Status Indicators**: In stock, low stock, out of stock
- **Add to Cart**: Seamless product addition

## 🛒 Shopping Cart

### **Cart Features**
- **Quantity Controls**: Increase/decrease item quantities
- **Real-time Totals**: Automatic price calculations
- **Empty State**: Helpful messaging when cart is empty
- **Checkout Flow**: Complete purchase process

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### **Code Quality**
- **TypeScript**: Full type safety throughout
- **ESLint**: Code quality and consistency
- **Prettier**: Consistent code formatting
- **Modular Architecture**: Clean separation of concerns

## 🎨 Styling

### **Tailwind CSS**
- **Utility-first**: Rapid UI development
- **Custom Theme**: Extended color palette and animations
- **Responsive**: Mobile-first responsive design
- **Dark Mode Ready**: Easy theme switching capability

## 📈 Future Enhancements

- **User Authentication**: Login/signup system
- **Payment Integration**: Stripe/PayPal integration
- **Real Backend**: Replace simulation with actual API
- **Advanced Analytics**: Detailed reporting and insights
- **Multi-language**: Internationalization support
- **PWA Features**: Offline capability and app-like experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
