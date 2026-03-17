# DigiMart 🛒
 
> **An open-source MERN stack e-commerce platform for digital products — built to learn.**

**🔗 Live Demo:** [https://digimart-fe.vercel.app](https://digimart-fe.vercel.app/)
 
DigiMart is a full-stack e-commerce web application purpose-built for selling and buying **digital products**. It covers the full spectrum of a real-world production app — authentication flows, role-based access, payment processing, file handling, email notifications, and more. You're encouraged to explore the codebase, study the implementation, and see how everything fits together.
 
> ⚠️ This project is for learning and reference purposes and **not intended for production use**.
 
---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Database Collections](#-database-collections)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [App Configuration](#-app-configuration)
- [License](#-license)

---

## 🧰 Tech Stack

| Layer      | Technologies                                              |
|------------|-----------------------------------------------------------|
| Frontend   | React 19, Redux Toolkit, React Router v7, Bootstrap 5, Vite |
| Backend    | Node.js, Express 5, MongoDB, Mongoose                     |
| Auth       | JWT (Access + Refresh Tokens), Google OAuth               |
| Payments   | Stripe Connect (Seller), Stripe Hosted Checkout (Buyer)   |
| Storage    | Cloudinary (avatars & product files)                      |
| Email      | Nodemailer / Gmail (dev), Zoho Mail API (prod)            |
| Analytics  | Google Analytics 4 via `react-ga4` (production only)     |

---

## ✨ Features

### 🔐 Authentication
- **JWT-based** auth: Access token stored in `localStorage`, Refresh token in an HTTP-only cookie
- **Manual Sign Up / Log In** with email verification
- **Google OAuth** Sign Up / Log In
- Password management: Set (for Google users), Change, Forgot & Reset

### 👥 Role-Based Access
| Permission              | Buyer | Seller |
|-------------------------|:-----:|:------:|
| Browse & Buy Products   | ✅    | ✅     |
| Seller Dashboard        | ❌    | ✅     |
| Create / Edit Products  | ❌    | ✅     |
| View Own Orders         | ✅    | ✅     |
| View Sales              | ❌    | ✅     |

### 📧 Email Notifications (Nodemailer)
1. **Account Verification** — sent on manual sign-up
2. **Reset Password** — sent on forgot password request
3. **Password Changed** — confirmation after password update
4. **Became a Seller** — sent when a user creates a shop
5. **Product Purchased** — order confirmation sent to buyer

### 🖼️ Media & File Handling
- **Cloudinary** for storing user avatars and product files
- **Sharp** for generating **watermarked previews** of digital products

### 🛍️ Shopping & Checkout
- **Cart** persisted as an array of product IDs in `localStorage`
- **Stripe Hosted Checkout** for buyers
- **Stripe Connect** for seller onboarding and payouts
- **10% platform fee** applied on full cart checkout

### 📊 Dashboards
- **Seller Dashboard:** Manage Products, view Orders & Sales, manage Shop
- **Buyer Dashboard:** View purchased Orders

### ⚙️ Settings Page
**Password Management Tab**
- Set Password *(Google-authenticated users only)*
- Change Password

**Account Management Tab**
- Edit User Profile
- Disconnect Google Account *(Google-connected users only)*
- Delete Account
- Create a Shop *(Buyer role only — converts to Seller)*

### 📈 Analytics
- Google Analytics 4 integrated via `react-ga4`, active in **production mode only**

---

## 🗄️ Database Collections

| Collection        | Description                                      |
|-------------------|--------------------------------------------------|
| `Users`           | User accounts, roles, auth info                  |
| `Shops`           | Seller shop profiles                             |
| `Products`        | Digital product listings                         |
| `Orders`          | Purchase records                                 |
| `BlackListedTokens` | Invalidated JWT tokens (logout/revocation)     |

---

## 📁 Project Structure
 
```
DigiMart/
├── frontend/                 # React frontend (Vite)
│   ├── config/
│   ├── public/
│   ├── src/
│   │   ├── app/              # Redux Toolkit store
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/         # Redux Toolkit slices
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── shared/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   └── vite.config.js
│
└── backend/                  # Express backend
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── models/           # Mongoose schemas
    │   ├── routes/
    │   ├── services/
    │   ├── utils/
    │   └── server.js
    └── .env
```

---

## 🔑 Environment Variables
 
### Frontend (`frontend/.env`)
 
```env
VITE_API_BACKEND_URL=                # Backend API base URL
VITE_PLATFORM_FEE_PERCENT=           # Platform fee percentage (e.g. 10)
VITE_API_GA_MEASUREMENT_ID=          # Google Analytics Measurement ID (production)
```
 
### Backend (`backend/.env`)
 
> A ready-to-fill `.env.example` file is included in the `backend/` directory.
 
```env
# App
NODE_ENV=                            # development | production
PORT=                                # e.g. 4000
PLATFORM_FEE_PERCENT=                # e.g. 10
BACKEND_URL=                         # e.g. http://localhost:4000
FRONTEND_URL=                        # e.g. http://localhost:5173
EXTRA_FRONTEND_URLS=                 # e.g. [] or comma-separated URLs
# REACT_FRONTEND_URL_BASE_NAME=      # e.g. digimart (only if deployed to a subdirectory)
 
# JWT
JWT_ACCESS_TOKEN_SECRET=             # a long, random secret string
JWT_STATE_SECRET=                    # a long, random secret string (for OAuth state)
 
# MongoDB
MONGODB_URI=                         # e.g. mongodb://127.0.0.1:27017/DigiMart
 
# Cloudinary
CLOUDINARY_CLOUD_NAME=               # your Cloudinary cloud name
CLOUDINARY_API_KEY=                  # your Cloudinary API key
CLOUDINARY_API_SECRET=               # your Cloudinary API secret
 
# Google OAuth
GOOGLE_CLIENT_ID=                    # from Google Cloud Console → OAuth 2.0 Client ID
GOOGLE_CLIENT_SECRET=                # from Google Cloud Console → OAuth 2.0 Client Secret
GOOGLE_REDIRECT_URI=                 # e.g. http://localhost:4000/auth/google/callback
 
# Email — Development (Gmail + Nodemailer App Password)
EMAIL_USER=                          # your Gmail address
EMAIL_PASS=                          # your 16-character Google App Password
 
# Email — Production (Zoho Mail API)
ZOHO_CLIENT_ID=                      # from Zoho API Console
ZOHO_CLIENT_SECRET=                  # from Zoho API Console
ZOHO_REFRESH_TOKEN=                  # Zoho OAuth refresh token
ZOHO_ACCOUNT_ID=                     # your Zoho mail account ID
ZOHO_EMAIL=                          # your Zoho sender email address
 
# Exchange Rate API (currency conversion)
EXCHANGERATE_API_KEY=                # from exchangerate-api.com
 
# Stripe (Test Mode)
STRIPE_SECRET_KEY=                   # sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_CLIENT_ID=                    # ca_XXXXXXXXXXXXXXXXXXXXXXXX (Stripe Connect)
STRIPE_REDIRECT_URI=                 # e.g. http://localhost:4000/stripe/connect/callback
STRIPE_SUCCESS_URL=                  # e.g. http://localhost:5173/checkout/success
STRIPE_CANCEL_URL=                   # e.g. http://localhost:5173/checkout/cancel
STRIPE_WEBHOOK_SECRET=               # whsec_XXXXXXXXXXXXXXXX
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- Accounts for: Cloudinary, Stripe, Google Cloud Console, Nodemailer/Zoho

### 1. Clone the Repository

```bash
git clone https://github.com/adnannazir235/digimart.git
cd digimart
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Configure Environment Variables

Copy and fill in the environment variables described in the [Environment Variables](#-environment-variables) section for both `frontend/.env` and `backend/.env`.

### 4. Run the Development Servers

```bash
# Start the backend (from /backend)
npm run dev

# Start the frontend (from /frontend)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:4000` (or your configured `PORT`).

---

## 🌐 Deployment

| Layer    | Platform  |
|----------|-----------|
| Frontend | [Vercel](https://vercel.com) |
| Backend  | [Render](https://render.com) |

### Frontend — Vercel
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend/`
3. Add all `VITE_*` environment variables in the Vercel dashboard
4. Deploy

### Backend — Render
1. Connect your GitHub repository to Render
2. Set the root directory to `backend/`
3. Set the start command to `node src/server.js` (or `npm start`)
4. Add all server environment variables in the Render dashboard
5. Deploy

> **Note:** Make sure your `FRONTEND_URL` on the backend matches the deployed Vercel URL, and update `VITE_API_BACKEND_URL` on the frontend to match the deployed Render URL.

---

## ⚙️ App Configuration

| Setting              | Value / Notes                                          |
|----------------------|--------------------------------------------------------|
| Platform Fee         | **10%** on full cart checkout                          |
| Stripe Mode          | **Test Mode**                                          |
| Email (Development)  | Nodemailer with **Gmail** (Google App Password)        |
| Email (Production)   | **Zoho Mail API** (Zoho Mail Account)                  |
| Google Analytics     | Active in **production** only                          |
| Token Storage        | Access → `localStorage` · Refresh → HTTP-only cookie  |

---

## 📦 Key Dependencies

### Frontend

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `@reduxjs/toolkit` + `react-redux` | State management |
| `react-router-dom` | Client-side routing |
| `bootstrap` + `react-bootstrap` | UI styling |
| `axios` | HTTP requests |
| `formik` + `yup` | Form handling & validation |
| `react-toastify` | Toast notifications |
| `react-icons` | Icon library |
| `react-ga4` | Google Analytics 4 |
| `vite` | Build tool & dev server |

### Backend

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT auth |
| `bcrypt` | Password hashing |
| `cloudinary` | File/media storage |
| `sharp` | Image processing & watermarks |
| `stripe` | Payment processing |
| `nodemailer` | Email sending |
| `multer` | Multipart file uploads |
| `googleapis` | Google OAuth |
| `express-rate-limit` | API rate limiting |
| `cookie-parser` | Cookie handling |

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

You are free to use, study, modify, and distribute this software under the terms of the AGPL-3.0 license. Any derivative work must also be distributed under the same license.

See the [LICENSE](./LICENSE) file for the full license text, or visit [https://www.gnu.org/licenses/agpl-3.0.en.html](https://www.gnu.org/licenses/agpl-3.0.en.html).
