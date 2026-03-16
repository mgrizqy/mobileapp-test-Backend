# Backend – NestJS + MongoDB

## Stack
- NestJS
- MongoDB Atlas (Mongoose)
- JWT (access + refresh tokens)
- bcrypt for password hashing

## Setup
1. Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

JWT_ACCESS_SECRET=your_access_secret_here
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
```
2. `npm install`
3. `npm run start:dev`
