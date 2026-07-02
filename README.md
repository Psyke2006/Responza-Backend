# Responza Backend

The dedicated Node.js/Express.js backend for the Responza emergency monitoring app.

## Technology Stack
- Node.js
- Express.js
- Firebase Admin SDK (Firestore, FCM, Auth)
- dotenv
- helmet
- cors
- morgan
- nodemon (development)

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and adjust properties if needed:
```bash
cp .env.example .env
```

### 3. Run the Server

#### Development Mode (with hot-reloading)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

---

## API Endpoints

### Health Check
- **Endpoint**: `GET /health`
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "Responza Backend"
  }
  ```