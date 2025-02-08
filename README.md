# Newsletter API Backend

A Node.js/Express backend service for managing newsletter subscriptions with MySQL and Nodemailer integration.

## Features

- Email subscription management
- MySQL database integration
- Email notifications via Nodemailer
- Connection pooling for better performance
- API endpoints for subscription status, subscribe, and unsubscribe

## Tech Stack

- Node.js
- Express.js
- MySQL2
- Nodemailer
- CORS
- dotenv

## Setup

1. Clone the repository:
```bash
git clone <backend-repo-url>
cd newsletter-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

4. Create the MySQL table:
```sql
CREATE TABLE subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Start the server:
```bash
npm start
```

## API Endpoints

### Check Subscription Status
- **POST** `/check-status`
- Body: `{ "email": "user@example.com" }`

### Subscribe
- **POST** `/subscribe`
- Body: `{ "email": "user@example.com" }`

### Unsubscribe
- **DELETE** `/unsubscribe`
- Body: `{ "email": "user@example.com" }`

## Environment Variables

- `DB_HOST`: MySQL host
- `DB_PORT`: MySQL port
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: Gmail app password
