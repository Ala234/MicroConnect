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
cd MicroConnect
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
http://localhost:5173/


---

## ⚠️ Windows Users (PowerShell Issue)

If you encounter this error:
npm.ps1 cannot be loaded because running scripts is disabled

Run this command in PowerShell:
``` bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Then restart the terminal and try again.

---

## 💻 Usage

Open the project in the browser using:
http://localhost:5173

Navigate through:
-  the Login page  
- Choose their role (Brand / Influencer / Admin)  
- Based on the role, they are redirected to their dashboard  
- This is a front-end prototype (no real backend yet)

---

## 👥 Team Members

| Name | ID | Role |
|------|----|------|
| Sarah Almas | 202261060 | Data Base Contributor, Developer |
| Alanoud Aldaej | 202279560 | Leader, Developer |
| Yaqin Shawkan | 202255400 | Developer, Testing |
| Zainab Almusailiem | 202251360 | Developer, Documentation |

---

## 🔐 Environment Variables

No API keys are currently required for this front-end prototype. Future integration may require `.env` configuration (not included in the repository for security reasons).

---

## 📝 Notes

- This project is a front-end prototype only  
- Backend functionality will be implemented in future phases  
- The UI is based on a Figma design created during Phase 3  

---

## 📎 Figma Design

https://www.figma.com/design/KvuD9GvGwQqJ2pm5ABmph4/Phase-3?node-id=1-2700&p=f&t=eys0C4cBkKrESFWg-0

---

## 📌 Status

✅ Completed: Front-End Prototype (Milestone 4)  
🔄 Next: Backend Integration
