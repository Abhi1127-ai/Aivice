# 🧾 Aivice

> A production-ready AI-powered invoicing SaaS platform for freelancers, agencies, and small businesses to automate invoice creation, payment tracking, and client management.

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

---

## 📖 Overview

Managing invoices manually is time-consuming and error-prone. **Aivice** solves this by combining AI-generated invoice content, professional PDF export, automated email delivery, and real-time payment tracking — all in one platform.

### Problem
- Creating invoices manually is slow and repetitive
- Tracking overdue payments is hard to manage
- Writing professional descriptions every time wastes time
- Most invoicing tools are either too expensive or too basic

### Solution
A centralized SaaS platform where users can create clients, generate AI-powered invoices, export PDFs, send emails, and track payments from a single dashboard.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based login and registration
- Google OAuth login
- Refresh token mechanism
- Role-based access control (Admin, Business Owner, Accountant, Team Member)
- BCrypt password hashing

### 👥 Client Management
- Add, edit, delete clients
- Store billing address, GST/VAT number, payment terms
- Search and filter clients
- View per-client invoice history

### 🤖 AI Invoice Generation
- Auto-generate professional invoice descriptions
- Improve service wording with AI
- Generate payment reminder email drafts
- Detect missing invoice information

**Example:**
> Input: `Built ecommerce website with payment integration`
>
> AI Output: `Developed a full-stack eCommerce platform with secure payment gateway integration, responsive frontend implementation, product management functionality, and deployment configuration.`

### 📄 Invoice Management
- Create, edit, delete, duplicate invoices
- Save draft invoices
- Recurring invoice support
- Multiple line items with tax and discount
- Invoice statuses: `Draft` → `Sent` → `Viewed` → `Paid` / `Overdue`

### 📑 PDF Generation
- Dynamic professional PDF export
- Company branding and custom templates
- QR code payment links
- Watermarks for unpaid invoices
- Tax calculation included

### 💳 Payment Tracking
- Track payment status per invoice
- Partial payment support
- Overdue detection and automated reminders
- Payment history per client
- Stripe & Razorpay integration

### 📧 Email Automation
- Send invoices directly via email
- Automated overdue reminders
- Custom email templates
- Invoice delivery notifications

### 📊 Dashboard & Analytics
- Total & monthly revenue
- Pending and overdue invoice count
- Top clients by revenue
- Invoice trend graphs
- Growth tracking

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, ShadCN UI, React Router, Axios |
| Backend | Java, Spring Boot, Spring Security, Spring Data MongoDB |
| Database | MongoDB Atlas |
| Authentication | JWT, Google OAuth 2.0, BCrypt |
| AI | Gemini API, OpenAI API |
| PDF | iText PDF / OpenPDF |
| Payments | Stripe, Razorpay |
| Email | JavaMailSender, SendGrid |
| DevOps | Docker, GitHub Actions, Railway, Render |
| Storage | AWS S3 |

---

## 🏗 System Architecture

```
React Frontend
      ↓
REST API Layer (Spring Boot)
      ↓
Business Logic Layer
      ↓
Security Layer (JWT + Spring Security)
      ↓
MongoDB Atlas
      ↓
External Services
  ├── Gemini / OpenAI
  ├── Stripe / Razorpay
  ├── SendGrid / JavaMailSender
  └── AWS S3
```

### Backend Layered Architecture

```
Controller Layer   →  Handles HTTP requests & responses
Service Layer      →  Business logic & workflow
Repository Layer   →  MongoDB database operations
DTO Layer          →  Data transfer & validation
Security Layer     →  JWT filter, roles, guards
```

---

## 🗄 Database Design

### Users
| Field | Type |
|---|---|
| id | ObjectId |
| name | String |
| email | String (unique) |
| password | String (BCrypt) |
| role | String |
| createdAt | Date |

### Clients
| Field | Type |
|---|---|
| id | ObjectId |
| userId | ObjectId |
| companyName | String |
| email | String |
| gstNumber | String |
| billingAddress | String |
| paymentTerms | String |

### Invoices
| Field | Type |
|---|---|
| id | ObjectId |
| invoiceNumber | String |
| clientId | ObjectId |
| totalAmount | Decimal |
| dueDate | Date |
| status | String |

### Payments
| Field | Type |
|---|---|
| id | ObjectId |
| invoiceId | ObjectId |
| amount | Decimal |
| paymentMethod | String |
| paymentDate | Date |

---

## 📡 API Reference

### Authentication
```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
```

### Clients
```http
GET    /api/clients
POST   /api/clients
PUT    /api/clients/{id}
DELETE /api/clients/{id}
```

### Invoices
```http
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/{id}
PUT    /api/invoices/{id}
DELETE /api/invoices/{id}
GET    /api/invoices/{id}/pdf
POST   /api/invoices/{id}/send-email
```

### Payments
```http
POST   /api/payments
GET    /api/payments/history
```

### AI
```http
POST   /api/ai/generate-description
POST   /api/ai/generate-reminder
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- MongoDB Atlas account
- Gemini API key
- Stripe / Razorpay account

### Clone the Repository
```bash
git clone https://github.com/your-username/aivice.git
cd aivice
```

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your environment variables
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:8080`  
Frontend runs on `http://localhost:5173`

---

## ⚙️ Environment Variables

### Backend `.env`
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/aivice_db

JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=86400000

GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

STRIPE_SECRET_KEY=sk_test_xxxxx
RAZORPAY_KEY=rzp_test_xxxxx

MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
AWS_BUCKET_NAME=aivice-pdfs
```

---

## 📁 Folder Structure

```
aivice/
│
├── backend/
│   └── src/main/java/com/invoice/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── model/
│       ├── dto/
│       ├── security/
│       ├── exception/
│       └── config/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── utils/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docs/
└── README.md
```

---

## 🔮 Future Enhancements

- [ ] WhatsApp invoice delivery via Twilio
- [ ] Voice-to-invoice using Whisper API
- [ ] OCR receipt scanning
- [ ] AI payment prediction (detect late payers)
- [ ] Multi-language invoice support
- [ ] Mobile app (React Native)
- [ ] Team collaboration with shared workspaces
- [ ] Subscription billing with plan limits
- [ ] Public invoice verification page
- [ ] AI financial insights & forecasting

---

## 🧑‍💻 Author

**Abhishek**  
Full Stack Developer | Java Spring Boot + React  
[GitHub](https://github.com/Abhi1127-ai)

---

## 📄 License

This project is licensed under the MIT License.