# MicroConnect

## 📌 Project Description
MicroConnect is a web platform that connects brands with influencers to collaborate efficiently. The system provides different interfaces for each user type (Brand, Influencer, Admin) with a focus on usability and clean UI design based on Figma prototypes.

This project is developed as part of SWE363 course (Phase 3: Requirement & Prototyping).

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally:

### 1. Clone the repository
```bash 
git clone https://github.com/Ala234/MicroConnect.git
```

### 2. Navigate to the project folder
```bash 
cd .\front-end
```
### 3. Install dependencies
```bash 
npm install
```
### 4. Run the development server
```bash 
npm run dev
```
### 5. Open in browser
```bash 
http://localhost:5173/
```

---

## ⚠️ Windows Users (PowerShell Issue)

If you encounter this error:
npm.ps1 cannot be loaded because running scripts is disabled

Run this command in PowerShell:
```bash 
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Then try again.

---

## 💻 Usage

Open the project in the browser using:
http://localhost:5173


This project is a front-end application, so the data is currently handled using a mock data file (`mockCampaigns`, mockUsers, etc.) instead of a real API or backend.

### Demo Access

You can explore the system in two ways:

#### 1. Login
- Use any of the predefined users stored in the mock data.

Demo Accounts:
```bash 
export const users = [
  {
    email: "brand@test.com",
    password: "1234",
    role: "brand",
  },
  {
    email: "influencer@test.com",
    password: "1234",
    role: "influencer",
  },
  {
    email: "admin@test.com",
    password: "1234",
    role: "admin",
  },
];
```
#### 2. Create Account
- You can also create a new account directly from the UI.
- Enter any:
  - Username
  - Email
  - Password
- Then select your role:
  - Brand
  - Influencer

After creating an account, you will be able to access the dashboard and interact with the application features.

> Note: Since this is a front-end only project, no real authentication is performed and all data is stored temporarily using mock data.

---

## 👥 Team Members

| Name | ID | Role |
|------|----|------|
| Sarah Almas | 202261060 | Influncer |
| Alanoud Aldaej | 202279560 | Home ,Authentication (login, create account, validity), Brand and Readme file |
| Yaqin Shawkan | 202255400 | Admin |
| Zainab Almusailiem | 202251360 | Brand |

> Note: The work was distributed equally among team members based on the nature and complexity of tasks. All contributions were balanced to ensure fairness in terms of actual work effort.

> Note on Contributions: Sara worked on a separate branch and her work was later merged into the main branch. As a result, her name may not appear clearly in the commit history on the main branch, to view her contributions, please check the commit history and look for merge commits from her branch, where her work is included.


---

## 🔐 Environment Variables

No API keys are currently required for this front-end prototype. Future integration may require .env configuration (not included in the repository for security reasons).

---

## 📝 Notes

- This project is a front-end prototype only  
- Backend functionality will be implemented in future phases  
- The UI is based on a Figma design created during Phase 3  

---

## 📎 Figma Design

https://www.figma.com/design/KvuD9GvGwQqJ2pm5ABmph4/Phase-3?node-id=1-2700&p=f&t=eys0C4cBkKrESFWg-0

> Note: The design matches the Figma prototype, with only slight changes in background and button colors, which were allowed by the instructor.
---

## 📌 Status

✅ Completed: Front-End Prototype (Milestone 4)  
🔄 Next: Backend Integration
