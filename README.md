# MicroConnect

## 📌 Project Description
MicroConnect is a web platform that connects brands with influencers to collaborate efficiently. The system provides different interfaces for each user type (Brand, Influencer, Admin) with a focus on usability and clean UI design based on Figma prototypes.

This project is developed as part of SWE363 course (Phase 4: Full-Stack Implementation).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Email | Nodemailer + Gmail SMTP |

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally:

### 1. Clone the repository
```bash
git clone https://github.com/Ala234/MicroConnect.git
```

### 2. Navigate to the project folder
```bash
cd MicroConnect
```

---

## 🖥️ Backend Setup

### 1. Navigate to the backend folder
```bash
cd .\back-end
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the backend server
```bash
node server.js
```

Expected output:
```bash
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

---

## 🎨 Frontend Setup

### 1. Open a new terminal and navigate to the frontend folder
```bash
cd .\front-end
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Open in browser
```bash
http://localhost:5173
```

---

## ⚠️ Windows Users (PowerShell Issue)

If you encounter this error: `npm.ps1 cannot be loaded because running scripts is disabled`

Run this command in PowerShell:
```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then try again.

---

## 💻 Usage

1. Make sure both **backend** and **frontend** are running simultaneously
2. Open the project in the browser using `http://localhost:5173`
3. Navigate through the Login or Sign Up page
4. Based on the role, you are redirected to the appropriate dashboard
5. For admin, use one of these accounts (admins cannot self-register):
 ```bash
 admin4@microconnect.com
 password: admin4

 admin3@microconnect.com
 password: admin3
 ```

6. All data is persisted in **MongoDB Atlas** (no longer a front-end prototype)

---

## 🔄 Website Flow (Step by Step)

### 🔐 Authentication Flow
1. User opens the site → lands on the **Home page**
2. New user clicks **Sign Up** → fills the registration form (name, email, password, role: brand or influencer)
3. Existing user clicks **Login** → enters credentials → receives a JWT token saved in `localStorage`
4. If the user forgets their password:
   - Clicks **Forgot Password** → enters email
   - Receives a 6-digit code by email (sent via Gmail SMTP)
   - Enters the code on the **Verification** page
   - Sets a new password on the **Reset Password** page
5. Based on role, the user is redirected to the matching dashboard

### 🏷️ Brand Flow
1. **First registration** → redirected to `/brand/setup` to complete brand profile (logo, company name, industry, description, location, social links)
2. After setup → lands on the **Brand Dashboard** with their campaigns
3. **Login on later visits** → goes straight to the **Brand Dashboard**
4. Click **Create Campaign** → fills out campaign details → campaign saved to MongoDB and visible to influencers
5. Open a campaign to see all **influencer applications** with their stats
6. **Accept or Reject** each application
7. Click **View Profile** on any applicant → opens the influencer's full profile (bio, niches, platforms, reviews)
8. Click **Message** in the topbar → opens a real-time chat modal with that influencer (messages stored in MongoDB)
9. From the dashboard, navigate to **Contracts** to view all signed contracts
10. Edit brand profile any time at `/brand/profile`

### 👤 Influencer Flow
1. **First registration** → redirected to `/influencer/setup` to complete profile (bio, niches, audience, rates, socials)
2. After setup → lands on **Available Campaigns** page
3. **Login on later visits** → goes straight to Available Campaigns (or back to setup if profile is incomplete)
4. Browse campaigns, click into one for details
5. Click **Apply / Submit Proposal** → application sent to the brand
6. Track all applications under **My Applications** with their status (pending / accepted / rejected)
7. Open the **Messaging** page on a campaign → real-time chat with the brand running that campaign
8. View signed contracts under **Contracts**, completed work under **History**
9. Submit complaints/disputes under **Complaints** if there's a problem

### 🛡️ Admin Flow
1. Admin logs in with one of the seeded admin accounts (admins cannot register from the UI)
2. Lands on the **Admin Dashboard** with platform stats
3. **Manage Users** — view all users, suspend/unsuspend, or delete accounts
4. **Content Review** — review and approve/flag influencer bios
5. **Contracts** — view every contract on the platform
6. **Transactions** — review platform commissions
7. **Disputes** — view and resolve disputes raised by users
8. **Settings** — manage platform policies and commission rates
9. **Profile** — view/edit admin profile

### 💬 Messaging Flow (Brand ↔ Influencer)
1. Brand opens an applicant's profile and clicks **Message**, OR influencer opens a campaign's **Messaging** page
2. The chat modal/page polls `/api/messages/:userId` every 4 seconds and pulls all messages between the two users
3. Sending a message hits `POST /api/messages` → saved in MongoDB → delivered to the other side on the next poll
4. Both users see the same conversation regardless of device or browser

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| User | Stores name, email, hashed password, role, active status, password reset code |
| InfluencerProfile / Influencer | Stores influencer bio, socials, audience, rates, categories, status |
| Brand | Stores brand profile information (company name, industry, logo, socials) |
| Campaign | Stores campaign details created by brands |
| Application | Stores influencer applications/proposals to campaigns |
| Contract | Stores brand-influencer contracts and their status |
| Review | Stores brand reviews of influencers |
| BrandReview | Stores influencer reviews of brands |
| Message | Stores direct messages between two users (sender, recipient, text, timestamp) |
| Dispute | Stores disputes submitted by users |
| Settings | Stores platform policy and commission settings |

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a brand or influencer |
| POST | `/api/auth/login` | Login and receive JWT token |
| POST | `/api/auth/logout` | Logout current user |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/forgot-password` | Send a password reset code by email |
| POST | `/api/auth/verify-code` | Verify the 6-digit reset code |
| POST | `/api/auth/reset-password` | Set a new password using the verified code |

### Influencer Routes (`/api/influencers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/influencers` | Get all influencer profiles (filter by niche/category/status) |
| POST | `/api/influencers` | Create an influencer profile (influencer only) |
| GET | `/api/influencers/profile/me` | Get the current influencer's own profile |
| PUT | `/api/influencers/profile/me` | Update the current influencer's own profile |
| GET | `/api/influencers/:id` | Get an influencer by Influencer _id or User _id |
| PUT | `/api/influencers/:id` | Update an owned influencer profile |
| DELETE | `/api/influencers/:id` | Delete an owned influencer profile |

### Brand Routes (`/api/brands`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brands` | Get all brand profiles |
| GET | `/api/brands/:id` | Get a brand profile by ID |
| PUT | `/api/brands/:id` | Update a brand profile |

### Campaign Routes (`/api/campaigns`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | Get all active campaigns |
| GET | `/api/campaigns/my` | Get campaigns created by current brand |
| GET | `/api/campaigns/:id` | Get one campaign by ID |
| POST | `/api/campaigns` | Create a campaign (brand only) |
| PUT | `/api/campaigns/:id` | Update an owned campaign |
| DELETE | `/api/campaigns/:id` | Delete an owned campaign |

### Application Routes (`/api/applications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit an application to a campaign (influencer only) |
| GET | `/api/applications` | Get all applications |
| GET | `/api/applications/my` | Get current influencer's applications |
| GET | `/api/applications/campaign/:campaignId` | Get applications for a campaign (brand/admin) |
| GET | `/api/applications/influencer/:influencerId` | Get applications by a specific influencer |
| GET | `/api/applications/brand/:brandId` | Get applications for all campaigns of a brand |
| GET | `/api/applications/:id` | Get a single application |
| PUT | `/api/applications/:id/status` | Accept or reject an application |
| PUT | `/api/applications/:id` | Update an application |

### Contract Routes (`/api/contracts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contracts` | Create a contract (brand only) |
| GET | `/api/contracts` | Get all contracts |
| GET | `/api/contracts/my` | Get contracts of the current user |
| GET | `/api/contracts/influencer/:influencerId` | Get contracts of a specific influencer |
| GET | `/api/contracts/brand/:brandId` | Get contracts of a specific brand |
| GET | `/api/contracts/:id` | Get a contract by ID |
| PUT | `/api/contracts/:id/status` | Update a contract's status |
| PUT | `/api/contracts/:id` | Update a contract (brand/admin) |

### Review Routes (`/api/reviews`) — Brand reviewing Influencer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Brand creates a review of an influencer |
| GET | `/api/reviews/brand/:brandId` | Reviews written by a brand |
| GET | `/api/reviews/influencer/:influencerId` | Reviews received by an influencer |
| GET | `/api/reviews/campaign/:campaignId` | Reviews tied to a campaign |
| GET | `/api/reviews/contract/:contractId` | Reviews tied to a contract |
| GET | `/api/reviews/application/:applicationId` | Reviews tied to an application |

### Brand-Review Routes (`/api/brand-reviews`) — Influencer reviewing Brand
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/brand-reviews` | Influencer creates a review of a brand |
| GET | `/api/brand-reviews/brand/:brandId` | Reviews received by a brand |
| GET | `/api/brand-reviews/campaign/:campaignId` | Brand reviews tied to a campaign |
| GET | `/api/brand-reviews/application/:applicationId` | Brand review tied to an application |

### Message Routes (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:userId` | Get the conversation between current user and `:userId` |
| POST | `/api/messages` | Send a message (`{ recipientId, text }`) |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/profile` | Get the admin's own profile |
| PUT | `/api/admin/profile` | Update the admin's own profile |
| GET | `/api/admin/stats` | Get dashboard statistics |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get a user by ID |
| PATCH | `/api/admin/users/:id/suspend` | Suspend / unsuspend a user |
| DELETE | `/api/admin/users/:id` | Delete a user |
| GET | `/api/admin/users/:id/influencer-profile` | Get a user's influencer profile |
| GET | `/api/admin/users/:id/brand-profile` | Get a user's brand profile |
| GET | `/api/admin/campaigns` | Get all campaigns |
| GET | `/api/admin/campaigns/:id` | Get a campaign by ID |
| GET | `/api/admin/brands` | Get all brands |
| GET | `/api/admin/influencers` | Get all influencers |
| PATCH | `/api/admin/influencers/:id/bio-status` | Approve or flag an influencer's bio |
| GET | `/api/admin/applications` | Get all applications |
| GET | `/api/admin/contracts` | Get all contracts |
| GET | `/api/admin/contracts/:id` | Get a contract by ID |
| GET | `/api/admin/disputes` | Get all disputes |
| GET | `/api/admin/disputes/stats` | Dispute statistics |
| GET | `/api/admin/disputes/:id` | Get a dispute by ID |
| PATCH | `/api/admin/disputes/:id/resolve` | Resolve a dispute |
| GET | `/api/admin/policies` | Get platform policies |
| POST | `/api/admin/policies` | Add a policy |
| PUT | `/api/admin/policies/:id` | Update a policy |
| DELETE | `/api/admin/policies/:id` | Delete a policy |
| GET | `/api/admin/commission` | Get commission settings |
| PUT | `/api/admin/commission` | Update commission settings |

---

## 👥 Team Members

| Name | ID | Role |
|------|----|------|
| Sarah Almas | 202261060 | Database Contributor, Developer |
| Alanoud Aldaej | 202279560 | Leader, Developer |
| Yaqin Shawkan | 202255400 | Developer, Testing |
| Zainab Almusailiem | 202251360 | Developer, Documentation |

---

## 🔐 Environment Variables

The backend requires environment variables stored in `back-end/.env`:

- `PORT` — Server port (default: 5000)
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret key for signing JWT tokens
- `JWT_EXPIRES_IN` — Token expiration time (e.g., 7d)
- `EMAIL_USER` — Gmail address used to send password reset emails
- `EMAIL_PASS` — 16-character Gmail App Password (NOT the normal account password)

> ⚠️ The `.env` file is **never** committed to GitHub. It is shared privately with team members.

The frontend optionally uses `front-end/.env.local`:

- `VITE_API_URL` — Backend API base URL (default: `http://localhost:5000/api`)

---

## 🛡️ Security Notes

- ✅ Passwords are hashed using **bcryptjs**
- ✅ Routes are protected with **JWT authentication**
- ✅ Role-based access control (Brand / Influencer / Admin)
- ✅ Password reset codes expire after 15 minutes
- ✅ `.env` file is gitignored
- ✅ MongoDB credentials are never committed

---

## 📝 Notes

- This project includes a **fully functional backend** integrated with MongoDB Atlas
- All data (campaigns, applications, profiles, messages, reviews) is persisted in the cloud database
- Real-time messaging is implemented via short polling (4-second interval)
- Password reset codes are emailed via Gmail SMTP
- The UI is based on the Figma design from Phase 3
- Multiple users can collaborate in real-time through shared MongoDB Atlas

---

## 📎 Figma Design

https://www.figma.com/design/KvuD9GvGwQqJ2pm5ABmph4/Phase-3?node-id=1-2700&p=f&t=eys0C4cBkKrESFWg-0

---

## 📌 Status

✅ **Completed:** Front-End Prototype (Milestone 4)
✅ **Completed:** Backend Integration with MongoDB & JWT Authentication
✅ **Completed:** Password Reset via Email
✅ **Completed:** Real-Time Messaging Between Brands and Influencers
