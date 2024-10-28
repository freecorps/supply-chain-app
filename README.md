# Supply Chain Tracking System (Example Project)

This is an **example/demonstration project** that showcases the architecture and basic structure of a supply chain tracking system with blockchain integration. Please note that this is not a complete implementation and many core features are intentionally left out.

## ⚠️ Important Notice

This project is intended as a **learning resource** and **proof of concept**. It has several limitations and missing implementations:

- **Blockchain Integration**: The blockchain functionality is not fully implemented. The system only stores hashes but doesn't interact with any actual blockchain network.
- **Smart Contracts**: While the architecture supports smart contracts, their implementation is not included.
- **Validation Logic**: Many business rules and validation logic are missing or simplified.
- **Error Handling**: Basic error handling is implemented, but production-ready error handling is incomplete.
- **Security Features**: While basic RLS is implemented, additional security measures would be needed for production.
- **Testing**: Test coverage is minimal and would need to be expanded for production use.
- **Monitoring**: Advanced monitoring and logging systems are not implemented.

This project serves as a starting point or reference for understanding how different technologies (blockchain, traditional databases, modern frontend) can be combined in a supply chain tracking system.

## 🚀 Technologies

This project is built with modern web technologies:

- [Next.js](https://nextjs.org/) - React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types

## 🚀 Purpose

This project serves several educational purposes:
1. Demonstrates integration of modern web technologies (Next.js, Supabase, shadcn/ui, Tailwind)
2. Shows basic architecture for a hybrid system using blockchain and traditional databases
3. Provides examples of TypeScript implementations with proper typing
4. Demonstrates Row Level Security (RLS) implementation in Supabase
5. Shows basic CRUD operations with modern React patterns

## 🎯 Ideal Use Cases

This codebase is best used for:
- Learning modern web development patterns
- Understanding database schema design
- Studying TypeScript implementations
- Reference for Supabase + Next.js integration
- Starting point for similar projects

**Note:** This is not intended for production use without significant additional development.

## 🛠️ Setup

1. **Clone the repository**
```bash
git clone https://github.com/freecorps/supply-chain-app.git
cd supply-chain-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
bun install
```

3. **Environment Variables**

Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Database Setup**

The project uses Supabase as the database. To set up the database:

a. Create a new project in Supabase
b. Navigate to the SQL editor in your Supabase dashboard
c. Copy the contents of `tables.sql` and execute them in the SQL editor
d. This will:
   - Create all necessary tables with appropriate relationships
   - Set up Row Level Security policies
   - Create triggers for automatic profile creation
   - Set up validation functions for supply chain transactions
   - Initialize report and notification systems

4. **Database Setup**

- Create a new project in Supabase
- Execute the SQL commands from `tables.sql` in the Supabase SQL editor
- This will create the necessary tables and set up Row Level Security policies

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
bun run dev
```

## 📚 Database Schema

The following tables are created in Supabase (see `tables.sql` for complete schema):

### Core Tables
- `profiles` - User profiles and authentication
  - Stores user information including username, full name, company name, and role
  - Automatically created for new users via trigger

- `products` - Product information
  - Tracks products with name, description, category, SKU, and status
  - Includes metadata field for flexible additional data

- `locations` - Warehouses, distribution centers, etc.
  - Manages physical locations including name, address, type
  - Stores coordinates for geographical tracking
  - Includes metadata for additional information

### Transaction and Logistics Tables
- `supply_chain_transactions` - Blockchain transaction references
  - Records all supply chain events (production, transport, storage, delivery)
  - Links to products and locations
  - Stores blockchain hash for immutability
  - Maintains transaction chain via previous_transaction_id

- `logistics_details` - Detailed logistics information
  - Records environmental data (temperature, humidity)
  - Tracks transport details (vehicle, duration)
  - Stores quality checks and additional data
  - Links to supply chain transactions

### Reporting and Notifications
- `reports` - Scheduled and custom reports
  - Supports different report types (supply_chain, logistics, inventory, performance)
  - Configurable frequencies (daily, weekly, monthly, custom)
  - Tracks execution status and schedule

- `notifications` - System notifications
  - Manages user notifications and alerts
  - Different types (info, success, warning, error)
  - Tracks read/unread status per user

All tables implement Row Level Security (RLS) with appropriate policies for data access control.

## 🔐 Security

The application implements:
- Row Level Security (RLS) policies for all tables
- Authentication via Supabase Auth
- Automatic profile creation for new users
- Role-based access control

## 🌟 Features

### Implemented Features
- Basic Product Management CRUD operations
- Simple Location Tracking
- Supply Chain Transaction Recording (without actual blockchain implementation)
- Basic User Management
- Row Level Security (RLS) implementations

### Features Not Implemented
- Actual blockchain network integration
- Smart contract functionality
- Real-time tracking and monitoring
- Advanced analytics and reporting
- Comprehensive error handling and validation
- Production-level security measures
- Complete logistics tracking system
- Real-time notifications
- File handling and document management
- Complete test coverage
- Advanced user roles and permissions
- Audit logging
- Performance optimization
- Comprehensive API documentation

## 📱 Pages

- Dashboard
- Products Management
- Locations Management
- Supply Chain Transactions
- Logistics Monitoring
- Analytics & Reports
- User Settings
- Help & Documentation

## 🔄 Development Workflow

1. Create feature branch
2. Implement changes
3. Test locally
4. Create pull request
5. Review and merge

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ✨ Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Supabase](https://supabase.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
