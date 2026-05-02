# MicroConnect

## Project Description

MicroConnect is a platform that connects brands with micro-influencers. Brands can create campaigns, influencers can apply to campaigns, contracts can be created after accepted proposals, and admins can manage users, disputes, contracts, policies, and platform settings.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JWT |

## Project Structure

```text
MicroConnect/
├── back-end/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── front-end/
│   ├── src/
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
```

Backend folders:

- `config`: MongoDB connection
- `controllers`: request/response logic
- `middleware`: authentication, role checks, and error handling
- `models`: Mongoose schemas
- `routes`: API endpoint definitions
- `server.js`: Express server entry point

## Environment Variables

Create a `.env` file inside `back-end/` with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Do not paste real secret values into the README. The `.env` file is included in `.gitignore`, so database credentials and JWT secrets should stay local.

## How to Run the Backend

```bash
cd back-end
npm install
node server.js
```

Expected output:

```text
✅ MongoDB Connected Successfully
Server running on port 5000
```

## How to Run the Frontend

```bash
cd front-end
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## User Roles

Admin:

- manage users
- manage influencers and brands
- review disputes
- view contracts
- manage policies and commission

Brand:

- create and manage campaigns
- view applications/proposals
- accept or reject applications
- create/send contracts

Influencer:

- complete profile setup
- browse campaigns
- submit applications/proposals
- view application status
- receive and respond to contracts
- raise disputes

## Database Models

| Model | Description |
|---|---|
| User | Stores name, email, password, role, and active status |
| Influencer | Stores influencer profile, socials, audience, rates, and bioState |
| Brand | Stores brand profile information |
| Campaign | Stores campaign details created by brands |
| Application | Stores influencer proposals/applications |
| Contract | Stores brand-influencer contracts |
| Dispute | Stores disputes submitted by users |
| Settings | Stores platform policy and commission settings |

## API Documentation

### Auth Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a brand or influencer | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |
| POST | `/api/auth/logout` | Logout current user | Yes |
| GET | `/api/auth/me` | Get current authenticated user | Yes |

### Brand Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/brands` | Get all brand profiles | No |
| GET | `/api/brands/:id` | Get one brand profile by ID | No |
| PUT | `/api/brands/profile` | Create or update current brand profile | Yes, brand |

### Influencer Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/influencers` | Create influencer profile | Yes, influencer |
| GET | `/api/influencers` | Get influencer profiles with optional filters | No |
| GET | `/api/influencers/profile/me` | Get current influencer profile | Yes, influencer |
| PUT | `/api/influencers/profile/me` | Update current influencer profile | Yes, influencer |
| GET | `/api/influencers/:id` | Get one influencer profile by ID | No |
| PUT | `/api/influencers/:id` | Update owned influencer profile | Yes, influencer |
| DELETE | `/api/influencers/:id` | Delete owned influencer profile | Yes, influencer |

### Campaign Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/campaigns` | Get active campaigns | Yes |
| GET | `/api/campaigns/my` | Get campaigns created by current brand | Yes, brand |
| GET | `/api/campaigns/:id` | Get one campaign by ID | Yes |
| POST | `/api/campaigns` | Create a campaign | Yes, brand |
| PUT | `/api/campaigns/:id` | Update an owned campaign | Yes, brand |
| DELETE | `/api/campaigns/:id` | Delete an owned campaign | Yes, brand |

### Applications / Proposals Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/applications` | Submit an application/proposal to a campaign | Yes, influencer |
| GET | `/api/applications/my` | Get current influencer applications | Yes, influencer |
| GET | `/api/applications/campaign/:campaignId` | Get applications for a brand campaign | Yes, brand |
| PUT | `/api/applications/:id` | Accept or reject an application | Yes, brand |

### Admin / Users Routes

All admin routes require a valid JWT token for a user with the `admin` role.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/profile` | Get current admin profile | Yes, admin |
| PUT | `/api/admin/profile` | Update admin profile or password | Yes, admin |
| GET | `/api/admin/stats` | Get dashboard statistics | Yes, admin |
| GET | `/api/admin/users` | Get users with optional filters | Yes, admin |
| GET | `/api/admin/users/:id` | Get one user by ID | Yes, admin |
| PATCH | `/api/admin/users/:id/suspend` | Suspend or unsuspend a user | Yes, admin |
| DELETE | `/api/admin/users/:id` | Delete a user | Yes, admin |
| GET | `/api/admin/users/:id/influencer-profile` | Get a user's influencer profile | Yes, admin |
| GET | `/api/admin/users/:id/brand-profile` | Get a user's brand profile | Yes, admin |
| GET | `/api/admin/influencers` | Get influencers for admin/content review | Yes, admin |
| PATCH | `/api/admin/influencers/:id/bio-status` | Approve or flag an influencer bio | Yes, admin |
| GET | `/api/admin/campaigns` | Get campaigns for admin review | Yes, admin |
| GET | `/api/admin/campaigns/:id` | Get one campaign for admin review | Yes, admin |
| GET | `/api/admin/brands` | Get all brands for admin review | Yes, admin |
| GET | `/api/admin/applications` | Get all applications | Yes, admin |

### Disputes Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/disputes` | Get all disputes | Yes, admin |
| GET | `/api/admin/disputes/stats` | Get dispute statistics | Yes, admin |
| GET | `/api/admin/disputes/:id` | Get one dispute by ID | Yes, admin |
| PATCH | `/api/admin/disputes/:id/resolve` | Resolve a dispute with an admin response | Yes, admin |

### Contracts Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/contracts` | Get all contracts | Yes, admin |
| GET | `/api/admin/contracts/:id` | Get one contract by ID | Yes, admin |

### Settings / Policies Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/policies` | Get platform policies | Yes, admin |
| POST | `/api/admin/policies` | Add a platform policy | Yes, admin |
| PUT | `/api/admin/policies/:id` | Update a platform policy | Yes, admin |
| DELETE | `/api/admin/policies/:id` | Delete a platform policy | Yes, admin |
| GET | `/api/admin/commission` | Get current commission rate | Yes, admin |
| PUT | `/api/admin/commission` | Update commission rate | Yes, admin |

## Example API Requests

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Sara",
  "email": "sara@example.com",
  "password": "password123",
  "role": "influencer"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "sara@example.com",
  "password": "password123"
}
```

### Create Campaign

```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Spring Collection",
  "objective": "Brand Awareness",
  "description": "Promote the new collection",
  "startDate": "2026-05-01",
  "endDate": "2026-06-30",
  "budget": 3500,
  "targetAudience": "Women 25-35 interested in fashion",
  "contentType": "Short-form video review",
  "platforms": ["Instagram", "TikTok"]
}
```

### Submit Application

```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "campaignId": "CAMPAIGN_ID_HERE",
  "proposal": "I would love to collaborate on this campaign."
}
```

## Error Handling and Validation

The backend uses `express-validator`, manual validation, and Mongoose schema validation. Error middleware exists in `back-end/middleware/errorMiddleware.js`.

Common status codes:

- `200`: success
- `201`: created
- `400`: validation error
- `401`: unauthorized
- `403`: forbidden
- `404`: not found
- `413`: payload too large
- `500`: server error

## Frontend/Backend Integration

Connected features:

- Authentication and role-based login
- Influencer profile creation and updates
- Campaign creation and listing
- Applications/proposals
- Brand application review
- Admin user management
- Admin content review
- Disputes and contracts pages

## Demo Accounts

Influencer Demo Accounts:

- Sarah/Sara: `sarah.johnson@email.com` / `password123`
- Mia: `mia.carter@email.com` / `password123`
- Jason: `jason.creator@email.com` / `password123`

Do not include database credentials in the repository.

## Security Notes

- Do not commit `.env`.
- Do not commit MongoDB credentials.
- Do not commit JWT secrets.
- `node_modules` is ignored.
- Use JWT tokens in the Authorization header for protected routes.

## Known Limitations

- There is no automated test suite yet.
- Response formats may vary slightly between controllers.
- Admin account creation is not exposed through public registration.