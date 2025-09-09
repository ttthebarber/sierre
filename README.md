<<<<<<< HEAD
sdfsckm
=======
# Sierre - KPI Tracker

A comprehensive KPI tracking application built with Next.js, TypeScript, and modern web technologies. Track your business metrics across multiple Shopify stores with real-time data synchronization and beautiful visualizations.

## ✨ Features

### 🔐 Authentication & User Management
- **Clerk Integration**: Secure user authentication with sign-in/sign-up flows
- **User Profile Management**: Profile display in sidebar with user name and avatar
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic session handling and user state management

### 📊 Dashboard & Analytics
- **Unified KPI Dashboard**: Comprehensive overview of all connected stores
- **Portfolio Health Score**: Overall health assessment across all stores
- **Store Performance Grid**: Individual store metrics and performance indicators
- **Cross-Store Insights**: Comparative analytics across multiple stores
- **Interactive Charts**: Revenue trends, performance metrics, and data visualizations
- **Store Switcher**: Easy navigation between different stores
- **Real-time Metrics**: Live data updates and synchronization

### 🛍️ Shopify Integration
- **OAuth Connection**: Secure Shopify store connection via OAuth 2.0
- **Data Synchronization**: Automatic sync of orders, products, and inventory
- **Webhook Support**: Real-time data updates via Shopify webhooks
- **Store Management**: Connect, disconnect, and manage multiple Shopify stores
- **API Integration**: Full Shopify Admin API integration for comprehensive data access

### 📈 KPI Tracking & Analytics
- **Revenue Tracking**: Monitor sales performance and revenue trends
- **Order Analytics**: Track order volume, average order value, and conversion rates
- **Product Performance**: Identify top-performing products and categories
- **Daily Aggregates**: Daily, weekly, and monthly performance summaries
- **Historical Data**: Track performance over time with historical analytics
- **Custom Metrics**: Define and track custom business KPIs

### ⚙️ Settings & Configuration
- **Account Settings**: User profile and account management
- **Store Management**: View and manage connected Shopify stores
- **Sync Controls**: Manual sync triggers and sync status monitoring
- **Billing & Subscription**: Subscription management and billing information
- **Integration Status**: Real-time status of all connected integrations

### 🎨 User Interface & Experience
- **Notion-style Design**: Clean, minimal interface inspired by Notion
- **Responsive Layout**: Mobile-first responsive design
- **Collapsible Sidebar**: Space-efficient navigation with collapsible sidebar
- **Dark/Light Mode Ready**: UI components ready for theme switching
- **Accessible Components**: WCAG-compliant UI components
- **Smooth Animations**: Polished interactions and transitions

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **API Routes**: Comprehensive REST API for all functionality
- **Database Integration**: Supabase integration for data persistence
- **Error Handling**: Robust error handling and user feedback
- **Performance Optimized**: Optimized for speed and efficiency
- **Production Ready**: Built for production deployment on Vercel

## 🚀 Current Implementation Status

### ✅ Fully Implemented
- **Authentication System**: Complete Clerk integration with sign-in/sign-up flows
- **Dashboard Interface**: Full KPI dashboard with charts, metrics, and store management
- **Shopify Integration**: Complete OAuth flow, data sync, and webhook handling
- **API Infrastructure**: Comprehensive REST API with all necessary endpoints
- **Database Schema**: Supabase integration with proper data models
- **UI Components**: Complete shadcn/ui component library with custom styling
- **Responsive Design**: Mobile-first responsive layout with Notion-style interface

### 🔄 API Endpoints Available
- **Authentication**: `/api/auth/*` - Clerk authentication handling
- **Shopify Integration**: `/api/integrations/shopify/*` - Complete Shopify API integration
- **KPI Analytics**: `/api/kpis/*` - Portfolio, summary, and analytics endpoints
- **Data Sync**: `/api/integrations/sync` - Universal data synchronization
- **Webhooks**: `/api/integrations/shopify/webhooks` - Real-time data updates

### 📊 Data Models
- **Stores**: Connected Shopify store information and credentials
- **Orders**: Order data with customer and product information
- **Products**: Product catalog with performance metrics
- **Subscriptions**: User subscription and billing information
- **KPIs**: Custom key performance indicators and metrics

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Recharts** - Data visualization and charts
- **Lucide React** - Beautiful icon library

### Backend & Services
- **Clerk** - Authentication and user management
- **Supabase** - Database and real-time subscriptions
- **Shopify Admin API** - E-commerce data integration
- **Vercel** - Deployment and hosting platform

### Development Tools
- **ESLint** - Code linting and quality
- **TypeScript** - Static type checking
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Clerk account for authentication
- Supabase account for database
- Shopify Partner account for app development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sierre
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
   
   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Shopify Integration
   SHOPIFY_API_KEY=your_shopify_api_key
   SHOPIFY_API_SECRET=your_shopify_api_secret
   SHOPIFY_REDIRECT_URL=http://localhost:3000/api/integrations/shopify/callback
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   Run the SQL schema from `supabaseSQL.sql` in your Supabase dashboard

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📦 Deployment

This application is optimized for deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── integrations/      # Integrations page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── api/              # API clients
│   └── integrations/     # Integration logic
└── public/               # Static assets
```

## 📊 Database Schema

The application uses Supabase with the following main tables:

- **`stores`** - Connected Shopify store information and credentials
- **`orders`** - Order data with customer and product information  
- **`products`** - Product catalog with performance metrics
- **`subscriptions`** - User subscription and billing information
- **`kpis`** - Custom key performance indicators and metrics
- **`kpi_history`** - Historical KPI data for trend analysis

See `supabaseSQL.sql` for the complete database schema.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

- **Code Style**: Follow TypeScript best practices and existing code patterns
- **Components**: Use shadcn/ui components and maintain consistency
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update README and code comments as needed
- **Accessibility**: Ensure all components are accessible and WCAG compliant

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join GitHub Discussions for questions and community support

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
>>>>>>> 895c83f (readme)
