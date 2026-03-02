# Restaurant App MVP - Backend Overview

## Overview
Backend for the Restaurant App MVP built with **Node.js**, **Express**, and **PostgreSQL**. Provides REST APIs for authentication, menu items, orders, and reservations.

## Prerequisites
- Node.js (v20+) and npm
- PostgreSQL database (e.g., Railway, Supabase, or any provider)
- Cloudinary account for image storage (optional)

## Setup & Run
1. Navigate to the backend directory:
   ```bash
   cd restaurant-app-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with required variables:
   ```text
   PORT=5000
   DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. (Optional) Seed the database:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
   API available at `http://localhost:5000/api`. Health check: `http://localhost:5000/health`.

## License
Educational assignment use only.
