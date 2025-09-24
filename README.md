# RBD E-Commerce

A modern, full-featured e-commerce application built with Next.js 14, TypeScript, and Tailwind CSS. Features include user authentication, shopping cart, PayPal checkout, admin panel, and comprehensive SEO optimization.

## Features

### 🛍️ E-Commerce Features
- **Product Catalog**: Browse and search products with filtering and sorting
- **Shopping Cart**: Add/remove items with persistent cart state
- **Checkout**: Secure PayPal payment integration with guest checkout
- **Order Management**: Track orders and view order history
- **User Authentication**: Sign up, sign in, and guest checkout support

### 🔐 Authentication & Security
- **NextAuth.js**: Secure authentication with multiple providers
- **Role-based Access**: Admin and user roles with different permissions
- **Password Hashing**: Secure password storage with bcrypt
- **Session Management**: JWT-based session handling

### 🎨 User Interface
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI Components**: Custom components with hover effects and animations
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant components

### 🛠️ Admin Panel
- **Dashboard**: Overview of products, orders, users, and revenue
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and update order status
- **User Management**: Manage user accounts and roles
- **Analytics**: Sales and performance metrics

### 🔍 SEO Optimization
- **Meta Tags**: Dynamic meta tags for all pages
- **Structured Data**: JSON-LD structured data for products and organization
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine crawling instructions
- **Open Graph**: Social media sharing optimization

### 🚀 Performance
- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic code splitting for optimal performance
- **Caching**: Efficient caching strategies

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: PayPal SDK
- **State Management**: React Context + useReducer
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- PayPal Developer Account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rbd-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/rbd_ecommerce"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # PayPal
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main entities:

- **Users**: Customer and admin accounts
- **Products**: Product catalog with categories
- **Orders**: Order management with items and addresses
- **Categories**: Product categorization
- **Cart Items**: Shopping cart functionality

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/[id]` - Update product (admin)
- `DELETE /api/admin/products/[id]` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details

### Admin
- `GET /api/admin/products` - Get all products (admin)
- `GET /api/admin/orders` - Get all orders (admin)
- `GET /api/admin/users` - Get all users (admin)

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Other Platforms

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Set up your database and environment variables**

## PayPal Integration

1. **Create a PayPal Developer Account**
2. **Create a new application**
3. **Get your Client ID and Client Secret**
4. **Add them to your environment variables**
5. **Test with PayPal Sandbox before going live**

## Admin Access

To access the admin panel:

1. **Create a user account**
2. **Update the user role to ADMIN in the database**
3. **Sign in and navigate to `/admin`**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@rbdstore.com or create an issue in the repository.

## Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Inventory management
- [ ] Discount codes and coupons
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Mobile app (React Native)
