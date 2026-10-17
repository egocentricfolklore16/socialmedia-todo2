# 📣 SocialTodo — Social Media Manager Todo App

> **Never miss a post.** A full-stack todo app built for social media managers, with Google Calendar integration, holiday notifications, and a content calendar view.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ✅ **Task Management** | Create, edit, delete tasks with platform tags, content types, priorities, and hashtags |
| 📅 **Google Calendar Sync** | OAuth2 login — push tasks directly to your Google Calendar with reminders |
| 🎉 **Holiday Alerts** | Automatic detection of upcoming holidays (US, UK, NG, GH, Christian) with browser push notifications |
| 📆 **Content Calendar** | Monthly/weekly grid showing all tasks, Google Calendar events, and holidays in one place |
| 🔔 **Push Notifications** | Browser push notifications for holidays and task reminders — even when the app is closed |
| 📊 **Stats Dashboard** | Live count of total, todo, in-progress, done, and overdue tasks |
| 🎨 **Platform Branding** | Color-coded by platform: Instagram, Twitter/X, LinkedIn, Facebook, TikTok, YouTube |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Google Cloud project with the Calendar API enabled

### Step 1 — Clone / Open the project

```
C:\Users\DELL PC\.gemini\antigravity\scratch\socialmedia-todo\
```

### Step 2 — Set up Google Cloud credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Calendar API**
4. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
5. Copy your **Client ID** and **Client Secret**

### Step 3 — Configure the backend

```bash
cd backend
copy .env.example .env
```

Edit `.env` and fill in:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Generate VAPID keys:
# npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:you@example.com

SESSION_SECRET=change_this_to_a_long_random_string
```

### Step 4 — Generate VAPID keys for push notifications

```bash
cd backend
npx web-push generate-vapid-keys
```

Copy the output into your `.env` file.

### Step 5 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 6 — Start the app

**Option A** — Double-click `start-dev.bat` (Windows)

**Option B** — Manually in two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
socialmedia-todo/
├── start-dev.bat           ← Launch both servers (Windows)
│
├── backend/
│   ├── server.js           ← Express app + cron job
│   ├── .env.example        ← Environment variables template
│   ├── routes/
│   │   ├── auth.js         ← Google OAuth2 routes
│   │   ├── tasks.js        ← Task CRUD API
│   │   ├── calendar.js     ← Google Calendar API
│   │   └── notifications.js← Push notification routes
│   ├── services/
│   │   ├── googleAuth.js   ← OAuth2 client factory
│   │   ├── store.js        ← File-based data store
│   │   ├── pushService.js  ← Web push via web-push
│   │   └── holidayService.js← Holiday detection + alerts
│   └── data/               ← Auto-created JSON storage
│
└── frontend/
    ├── public/
    │   ├── sw.js           ← Service worker (push notifications)
    │   └── index.html
    └── src/
        ├── App.js          ← Root component
        ├── index.js        ← Entry + SW registration
        ├── index.css       ← Global dark theme styles
        ├── context/
        │   └── AppContext.js   ← Global state (tasks, auth)
        ├── hooks/
        │   └── usePushNotifications.js  ← Push subscription hook
        └── components/
            ├── Navbar.js           ← Top navigation
            ├── StatsBar.js         ← Task count overview
            ├── GoogleAuthBanner.js ← Google connect CTA
            ├── HolidayBanner.js    ← Holiday alert banners
            ├── PlatformBadge.js    ← Branded platform badges
            ├── TodoList.js         ← Task list with filters
            ├── TaskForm.js         ← Create/edit task form
            └── ContentCalendar.js  ← react-big-calendar view
```

---

## 🔔 How Holiday Notifications Work

1. **Daily at 8:00 AM**, the backend cron job queries multiple public Google Calendar holiday feeds
2. Any holidays within the next **3 days** trigger a **browser push notification**
3. The frontend shows **dismissible banner alerts** for upcoming holidays
4. Holiday events appear in the **Content Calendar** highlighted in amber

To add more countries, edit `holidayService.js` and add the holiday calendar ID:
```js
'en.fr#holiday@group.v.calendar.google.com'  // France
'en.de#holiday@group.v.calendar.google.com'  // Germany
```

---

## 🌍 Supported Holiday Calendars (out of the box)

- 🇺🇸 United States
- 🇬🇧 United Kingdom
- ✝️ Christian holidays
- 🇬🇭 Ghana
- 🇳🇬 Nigeria

---

## 🛣️ Upgrade Path

| When you're ready... | Do this |
|---------------------|---------|
| Multiple users | Replace `store.js` with MongoDB or PostgreSQL + add user sessions |
| Direct social posting | Integrate Meta Graph API, Twitter API v2, LinkedIn API |
| AI captions | Add OpenAI/Gemini API to auto-generate post captions |
| Deployment | Deploy backend to Railway/Render, frontend to Vercel/Netlify |
