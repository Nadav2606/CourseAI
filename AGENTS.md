# AGENTS.md — JobAI

## Project Overview

JobAI is a Full-Stack job-search application built with Next.js using the App Router.

The application allows users to:

- Register with email and password
- Login with email and password
- Login with Google OAuth
- Maintain an authenticated session
- Manage a personal profile
- Upload and update a profile image
- Upload, view, replace, and delete a resume
- Set job-seeking status
- Browse job listings
- Search for jobs
- View job details
- Use a personalized dashboard
- Learn about the application through the About page

External job data is fetched from Drushim through Apify.

User-uploaded files such as profile images and resumes are stored in AWS S3.

---

# Tech Stack

The project currently uses:

- Next.js
- React
- JavaScript
- Next.js App Router
- React Server Components
- Client Components where necessary
- Server Actions
- Route Handlers
- Tailwind CSS
- MongoDB
- Mongoose
- Google OAuth
- JWT / session authentication
- bcrypt
- AWS S3
- Apify
- Drushim job data

Do not introduce TypeScript unless explicitly requested.

Do not replace existing technologies or libraries without a clear reason.

---

# Project Structure

Main project structure:

```text
actions/
├── auth.js
└── profile.js

app/
├── about/
│   └── page.jsx
│
├── api/
│   ├── auth/
│   │   └── google/
│   │       ├── callback/
│   │       │   └── route.js
│   │       └── route.js
│   │
│   └── resume/
│       └── view/
│           └── route.js
│
├── components/
│   ├── auth/
│   ├── home/
│   ├── jobs/
│   ├── layout/
│   └── profile/
│
├── dashboard/
├── jobCardinfo/
├── jobs/
├── lib/
├── login/
├── models/
├── profile/
├── register/
├── globals.css
├── layout.jsx
└── page.jsx

components/
└── ui/

public/
└── uploads/
    └── profile/
```

Preserve this structure unless there is a strong architectural reason to change it.

---

# Next.js App Router

This project uses the Next.js App Router.

Routes are created using folders under:

```text
app/
```

For example:

```text
app/about/page.jsx       → /about
app/dashboard/page.jsx   → /dashboard
app/profile/page.jsx     → /profile
app/jobs/page.jsx        → /jobs
```

Dynamic job pages use:

```text
app/jobCardinfo/[id]/page.jsx
```

Do not introduce the old Pages Router.

---

# Internal Navigation

For internal application navigation always prefer:

```javascript
import Link from "next/link";
```

Example:

```jsx
<Link href="/about">אודות</Link>
```

Do not use a normal `<a>` element for internal Next.js routes unless there is a specific reason.

External URLs may use normal anchor elements.

---

# Server Components

Prefer Server Components by default.

Do not add:

```javascript
"use client";
```

unless client-side functionality is actually required.

Server Components are preferred for:

- Database queries
- Authentication checks
- Fetching protected data
- Reading sessions
- Calling external APIs with secret credentials
- AWS S3 operations that require credentials

---

# Client Components

Use Client Components only when functionality requires:

- `useState`
- `useEffect`
- `useRef`
- `useActionState`
- `useFormStatus`
- event handlers
- browser APIs
- interactive UI

Keep Client Components focused on UI and interaction.

Sensitive operations must remain on the server.

---

# Authentication

Authentication-related code is located primarily in:

```text
actions/auth.js

app/lib/auth.js
app/lib/session.js
app/lib/google.js

app/api/auth/google/
```

The project supports:

- Email/password registration
- Email/password login
- Google OAuth
- Session authentication
- Logout

Do not create another authentication system.

Reuse the existing authentication implementation.

---

# Session User

When server-side code needs the authenticated user, use the existing:

```javascript
getSessionUser();
```

Example:

```javascript
const user = await getSessionUser();
```

Do not trust a user ID supplied directly by the browser.

Authorization should be based on the authenticated session.

---

# Password Security

Passwords must never be stored as plain text.

Continue using the existing bcrypt implementation.

Never:

- log passwords
- return passwords from API routes
- expose password hashes to Client Components
- store passwords in cookies
- send password hashes to the browser

---

# Google OAuth

Google OAuth implementation is located under:

```text
app/api/auth/google/
```

with:

```text
route.js
callback/route.js
```

Related utilities are located in:

```text
app/lib/google.js
app/lib/auth.js
app/lib/session.js
```

Preserve the existing OAuth flow.

Do not expose:

- Google client secret
- OAuth state values unnecessarily
- session secrets
- authorization codes

Do not remove OAuth state validation.

---

# MongoDB

MongoDB is the main application database.

Database connection logic is located in:

```text
app/lib/db.js
```

Reuse the existing database connection helper.

Do not create separate MongoDB connections inside:

- pages
- React components
- Server Actions
- API routes

unless the existing architecture specifically requires it.

---

# Mongoose

Mongoose models belong under:

```text
app/models/
```

Current user model:

```text
app/models/User.js
```

Reuse existing models whenever possible.

Before modifying the User schema, consider existing users already stored in MongoDB.

Avoid making a new field required if it could break existing documents.

---

# AWS S3

AWS S3 is the project's storage service for user-uploaded files.

S3 is currently used for:

- Profile images
- Resume files

Uploaded files should not be permanently stored on the Next.js server when S3 is the configured storage provider.

AWS operations must remain server-side.

---

# AWS S3 Security

Never expose AWS credentials to the browser.

AWS credentials must never appear inside:

```javascript
"use client";
```

components.

Never hardcode credentials such as:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

inside source files.

Credentials must be read from environment variables on the server.

Never log AWS credentials.

Never commit AWS credentials to GitHub.

---

# S3 File Ownership

Uploaded objects belong to individual users.

Before performing operations such as:

- viewing a private file
- replacing a file
- deleting a file

verify the authenticated user and ownership.

Never trust an S3 object key received from the browser without server-side validation.

One user must never be able to access another user's private resume.

---

# Profile Images

Profile-image functionality is located primarily under:

```text
app/components/profile/
actions/profile.js
```

The existing upload action is:

```javascript
uploadProfileImageAction;
```

Supported profile-image formats are:

```text
JPEG
PNG
WebP
```

Maximum expected image size:

```text
3 MB
```

Validate the file on the server even if the browser already restricts the file picker.

Do not rely only on:

```html
accept="image/jpeg,image/png,image/webp"
```

because browser-side restrictions can be bypassed.

---

# Re
