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

* View all users
* Ban / Unban users
* View all properties
* View all rental requests

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
* Prisma ORM

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

---

# 📂 Project Structure

```
src
│
├── app.ts
├── server.ts
│
├── config
├── errors
├── lib
├── middlewares
├── routes
├── utils
│
└── modules
    ├── auth
    ├── user
    ├── category
    ├── amenity
    ├── property
    ├── rental
    ├── payment
    ├── review
    └── admin
```

---

# 🗄️ Database Design

```
User
│
├── Profile
├── Property
│      ├── PropertyImage
│      ├── PropertyAmenity
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
PORT=5000

DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=

BCRYPT_SALT_ROUNDS=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET_KEY=

APP_URL=
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

Backend Developer | MERN Stack Developer
