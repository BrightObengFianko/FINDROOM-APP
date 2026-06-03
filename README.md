# FindRoom

FindRoom is a responsive full-stack room marketplace built with:

- React + Vite
- Tailwind CSS
- Express
- MongoDB + Mongoose
- MySQL for auth storage (optional)
- JWT authentication
- Cloudinary-ready avatar upload
- Mock payment flow
- Context API + React Router

The project is intentionally split into a `client` and `server` package so the frontend structure, backend API, and integration layer stay easy to understand.

## What is included

### Frontend

- Landing page with hero search, popular locations, and landlord CTA
- Login and signup flows with role selection and social-login UI placeholders
- Protected routes for user, landlord, and admin roles
- User dashboard with overview cards and recent activity
- Search page with responsive filters
- Room details page with gallery, amenities, contact action, and booking action
- My Bookings, Messages, Payments, Profile, Favorites, and Admin pages
- Context API state with API calls and graceful mock fallbacks

### Backend

- Express API with grouped routes for auth, rooms, bookings, messages, payments, users, dashboard, and admin
- MongoDB models for `User`, `Room`, `Booking`, `Message`, and `Payment`
- MySQL-backed `users` table support for login, signup, and auth/profile user storage
- JWT auth middleware and role-based access control
- Mock-mode service layer so the API still works when MongoDB is not configured
- Cloudinary-ready avatar upload endpoint with a fallback response when Cloudinary env vars are missing
- Mock checkout endpoint for payment flow structure

## Project structure

```text
findroom-app/
  client/
  server/
  README.md
```

## Setup

### 1. Install dependencies

From the project root:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Configure environment variables

Client:

```bash
copy client/.env.example client/.env
```

Server:

```bash
copy server/.env.example server/.env
```

Server environment values:

- `PORT=5000`
- `MONGO_URI=` optional; leave empty to start an embedded local MongoDB instance
- `MONGO_DB_NAME=findroom_db`
- `MYSQL_HOST=`
- `MYSQL_PORT=3306`
- `MYSQL_USER=`
- `MYSQL_PASSWORD=`
- `MYSQL_DATABASE=findroom_db`
- `JWT_SECRET=findroom-dev-secret`
- `CLOUDINARY_CLOUD_NAME=`
- `CLOUDINARY_API_KEY=`
- `CLOUDINARY_API_SECRET=`

### Local account

The seeded account below can sign in as `admin`, `landlord`, or `user` by selecting the role at login:

- `brightobengfianko@gmail.com` / `FindRoom123!`

### 3. Start the full stack app

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Run from Visual Studio Code

If you prefer VS Code, the repo now includes launch and task settings:

1. Open the `findroom-app` folder in VS Code.
2. Run `Terminal > Run Task > Install all dependencies` the first time.
3. Open `Run and Debug`.
4. Select `FindRoom: Run full stack`.
5. Press `F5`.

That starts the React client and the Express server from VS Code terminals.

## API overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/rooms`
- `GET /api/rooms/:roomId`
- `GET /api/bookings/me`
- `POST /api/bookings`
- `GET /api/messages/conversations`
- `POST /api/messages`
- `GET /api/payments/me`
- `POST /api/payments/mock-checkout`
- `PUT /api/users/me`
- `POST /api/users/me/avatar`
- `GET /api/dashboard/overview`
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/listings/:roomId/status`
- `DELETE /api/admin/users/:userId`

## Notes

- Without `MONGO_URI`, the server starts an embedded MongoDB instance, clears the old demo seed, and reseeds the current workspace data automatically.
- When MySQL env vars are configured, the server initializes `server/sql/init-findroom-db.sql`, extends the `users` table with the additional fields the app needs, and seeds the same bright account into MySQL auth.
- With MySQL auth enabled, login/signup/profile use MySQL while rooms, bookings, messages, and payments continue to use the app's existing Mongo/mock content flow as available.
- Without Cloudinary credentials, avatar uploads return a generated placeholder URL so the UI flow still works.
- The payment system is intentionally mock-only and structured for future gateway integration.

## Render deployment

This repo includes a `render.yaml` blueprint for a single Render web service.

- The frontend is built into `client/dist` and served by the Express server.
- API requests use `/api` in production, so the app works from one Render URL.
- The embedded Mongo data directory is mounted to a persistent disk at `server/.mongo-data` so login history and landlord verification state survive deploys.

To deploy:

1. Push the repo to GitHub.
2. Import the repository into Render using the blueprint.
3. Keep the attached disk enabled.
4. Add any production secrets you want to override, such as `JWT_SECRET`.
