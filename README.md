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


### 4. Run the backend server
```bash
node server.js
```

Expected output:
```bash
 MongoDB Connected Successfully
```
 Server running on port 5000

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

If you encounter this error: npm.ps1 cannot be loaded because running scripts is disabled

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
5. for admin, you can use one of these accounts: ( becuase admin cannot create an account by logic )
 ```bash
admin4@microconnect.com 
  password: admin4

 admin3@microconnect.com
  password: admin3
 ```
  
6. All data is now persisted in **MongoDB Atlas** (no longer a front-end prototype)

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| User | Stores name, email, password, role, and active status |
| InfluencerProfile | Stores influencer bio, socials, audience, rates, and categories |
| Brand | Stores brand profile information |
| Campaign | Stores campaign details created by brands |
| Application | Stores influencer proposals/applications to campaigns |
| Contract | Stores brand-influencer contracts |
| Dispute | Stores disputes submitted by users |
| Settings | Stores platform policy and commission settings |

---

## 🔌 API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a brand or influencer |
| POST | `/api/auth/login` | Login and receive JWT token |
| POST | `/api/auth/logout` | Logout current user |
| GET | `/api/auth/me` | Get current authenticated user |

### Influencer Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/influencers/profile` | Create or update influencer profile |
| GET | `/api/influencers/me` | Get current influencer's profile |
| GET | `/api/influencers/:id` | Get influencer profile by ID |
| GET | `/api/influencers/all` | Get all influencer profiles |

### Campaign Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | Get all active campaigns |
| GET | `/api/campaigns/my` | Get campaigns created by current brand |
| GET | `/api/campaigns/:id` | Get one campaign by ID |
| POST | `/api/campaigns` | Create a campaign |
| PUT | `/api/campaigns/:id` | Update an owned campaign |
| DELETE | `/api/campaigns/:id` | Delete an owned campaign |

### Application Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit application to a campaign |
| GET | `/api/applications/my` | Get current influencer's applications |
| GET | `/api/applications/campaign/:id` | Get applications for a campaign |
| PUT | `/api/applications/:id` | Accept or reject an application |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/stats` | Get dashboard statistics |
| GET | `/api/admin/contracts` | View all contracts |
| GET | `/api/admin/disputes` | View all disputes |

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

> ⚠️ The `.env` file is **never** committed to GitHub. It is shared privately with team members.

---

## 🛡️ Security Notes

- ✅ Passwords are hashed using **bcryptjs**
- ✅ Routes are protected with **JWT authentication**
- ✅ Role-based access control (Brand / Influencer / Admin)
- ✅ `.env` file is gitignored
- ✅ MongoDB credentials are never committed

---

## 📝 Notes

- This project now includes a **fully functional backend** integrated with MongoDB
- All data (campaigns, applications, profiles) is persisted in the cloud database
- The UI is based on the Figma design from Phase 3
- Multiple users can collaborate in real-time through shared MongoDB Atlas

---

## 📎 Figma Design

https://www.figma.com/design/KvuD9GvGwQqJ2pm5ABmph4/Phase-3?node-id=1-2700&p=f&t=eys0C4cBkKrESFWg-0

---

## 📌 Status

✅ **Completed:** Front-End Prototype (Milestone 4)  
✅ **Completed:** Backend Integration with MongoDB & JWT Authentication  


