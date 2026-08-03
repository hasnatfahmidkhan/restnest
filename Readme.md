# 🏠 RestNest API

A secure and scalable **Rental Property Management REST API** built with **Node.js**, **Express.js**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Stripe Checkout**. RestNest enables tenants to discover rental properties, landlords to manage listings and rental requests, and administrators to oversee the entire platform.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* JWT Authentication
* Refresh Token Support
* Role-Based Access Control (RBAC)
* Secure Password Hashing (bcrypt)

### 🏡 Property Management

* Create, update and delete properties
* Property image management
* Category & amenity support
* Search, filter, sorting & pagination
* Property availability management

### 🏷️ Categories & Amenities

* CRUD operations
* Duplicate validation
* Property-to-amenity relationship

### 📩 Rental Requests

* Tenant can request to rent a property
* Landlord can approve or reject requests
* Rental lifecycle:

  * Pending
  * Approved
  * Rejected
  * Active
  * Completed

### 💳 Stripe Payment Integration

* Stripe Checkout Session
* Stripe Webhook Verification
* Automatic payment verification
* Payment retry support
* Payment history

### ⭐ Reviews

* Only completed rentals can submit reviews
* One review per rental
* Property review listing

### 👨‍💼 Admin Features

* Dashboard statistics (Users, Properties, Rentals, Payments)
* View all users
* Ban / Unban users
* View all properties
* View single property
* View all rental requests

### 🏢 Landlord Features

* Dashboard statistics (Properties overview, Rental requests, Revenue, Average rating)

### 🧑‍🤝‍🧑 Tenant Features

* Dashboard statistics (Requests overview, Active rentals, Total amount paid)
* View recent rental requests

### ⏰ Scheduled Jobs

* Cron job automatically completes expired rentals
* Property availability automatically restored

---

# 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Prisma ORM (Multi-file Schema)

### Authentication

* JWT
* bcrypt

### Validation

* Zod

### Payment

* Stripe Checkout
* Stripe Webhooks

### Others

* node-cron
* Cookie Parser
* CORS
* HTTP Status
* dotenv
* tsup (for building)

---

# 📂 Project Structure

```
src
│
├── app.ts
├── server.ts
│
├── config
├── cron
├── errors
├── lib
├── middlewares
├── types
├── utils
│
└── modules
    ├── admin
    ├── amenity
    ├── auth
    ├── category
    ├── landlord
    ├── payment
    ├── property
    ├── rental
    ├── review
    └── tenant
```

---

# 🗄️ Database Design

```
User (Admin / Landlord / Tenant)
│
├── Profile
├── Property
│      ├── Category
│      ├── Amenity (via PropertyAmenity)
│      ├── PropertyImage
│      └── RentalRequest
│               │
│               ├── Payment
│               └── Review
```

---

# 🔄 Rental Flow

```
Tenant
   │
   ▼
Create Rental Request
   │
   ▼
Landlord Approves
   │
   ▼
Stripe Checkout
   │
   ▼
Webhook Verification
   │
   ▼
Payment Completed
   │
   ▼
Rental Active
   │
   ▼
Cron Job
   │
   ▼
Rental Completed
   │
   ▼
Tenant Can Review
```

---

# ⚙️ Installation

```bash
git clone https://github.com/yourusername/restnest.git

cd restnest

npm install
```

---

# 📦 Environment Variables

Create a `.env` file and configure:

```env
# Database Configuration
DATABASE_URL=

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Application URL
APP_URL=

# Security & Authentication
BCRYPT_SALT_ROUNDS=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

# Stripe Payments
STRIPE_PRICE_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET_KEY=
```

---

# ▶️ Running the Project

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

---

# 📌 Main API Modules

* Authentication
* Categories
* Amenities
* Properties
* Rental Requests
* Payments
* Reviews
* Landlord
* Tenant
* Admin

---

# 🔒 Security Features

* JWT Authentication
* HTTP-only Cookies
* Password Hashing
* Zod Request Validation
* Prisma Transactions
* Stripe Signature Verification
* Role-Based Authorization

---

# 💳 Payment Flow

```
Tenant
    │
    ▼
Create Checkout Session
    │
    ▼
Stripe Hosted Checkout
    │
    ▼
Webhook Event
    │
    ▼
Payment Updated
    │
    ▼
Rental Activated
    │
    ▼
Property Unavailable
```

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Hasnat Fahmid Khan**

Backend Developer | Full Stack Developer
