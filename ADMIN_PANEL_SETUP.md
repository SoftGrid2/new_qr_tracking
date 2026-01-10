# Admin Panel Setup Guide

## Overview

This admin panel has been upgraded with a professional, production-ready UI and advanced admin features including:

- ✅ JWT-based authentication
- ✅ Sidebar navigation with admin profile
- ✅ Dashboard with analytics cards and charts
- ✅ Analytics page with date filtering
- ✅ Enhanced product management with search and pagination
- ✅ QR Management with bulk download (ZIP)
- ✅ Admin profile with password change
- ✅ Modern UI with Tailwind CSS

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 3. Create Admin User

Run the script to create an admin user:

```bash
node src/scripts/createAdmin.js [email] [password] [name]
```

Example:
```bash
node src/scripts/createAdmin.js admin@example.com admin123 "Admin User"
```

If no arguments are provided, it will create:
- Email: `admin@example.com`
- Password: `admin123`
- Name: `Admin User`

### 4. Start Backend Server

```bash
npm run dev
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

## Features

### Dashboard
- Analytics cards showing:
  - Total Products
  - Active Products
  - Invalid Products
  - Total QR Scans
- Charts:
  - Daily Scan Count (last 7 days - line chart)
  - Monthly Scan Count (bar chart)

### Analytics Page
- Daily, weekly, and monthly scan analytics
- Product-wise scan count table
- Date range filtering

### Product Management
- Search by product name or ID
- Filter by status (active/invalid)
- Pagination
- QR preview and download

### QR Management
- Bulk download all QR codes as ZIP
- Custom bulk download (select specific products)
- Each QR image contains product ID printed below
- File naming: `QR_<productId>.png`

### Admin Profile
- View admin information
- Change password functionality

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Products
- `POST /api/products` - Create product (protected)
- `GET /api/products` - List products with search/pagination (protected)
- `GET /api/products/:productId/qr` - Download QR code (public)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats (protected)
- `GET /api/analytics/daily` - Daily scans (protected)
- `GET /api/analytics/monthly` - Monthly scans (protected)
- `GET /api/analytics/product-wise` - Product-wise scans (protected)
- `GET /api/analytics` - Full analytics with date filtering (protected)

### QR Management
- `POST /api/qr/bulk-download` - Download QR codes as ZIP (protected)
- `POST /api/qr/bulk-import` - Import custom QR designs (protected, placeholder)

### Upload
- `POST /api/upload/excel` - Bulk upload products from Excel (protected)

## Default Login Credentials

After running the createAdmin script:
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ IMPORTANT: Change the default password after first login!**

## Notes

- All admin routes are protected with JWT authentication
- QR download endpoint is public (for scanning purposes)
- The bulk QR import feature is a placeholder and can be implemented based on your needs
- Make sure to set a strong `JWT_SECRET` in production
