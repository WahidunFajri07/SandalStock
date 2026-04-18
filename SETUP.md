# Setup Instructions

Follow these steps to set up and run the Sandal Stock Management System.

## 1. Prerequisites
- Node.js (Latest LTS recommended)
- MySQL Server

## 2. Dependencies
Install the required packages using the following command:

```bash
npm install mysql2 lucide-react xlsx jspdf jspdf-autotable sonner
```

> [!NOTE]
> Tailwind CSS is already configured in this project.

## 3. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or terminal).
2. Execute the SQL commands in `database/schema.sql`. This will:
   - Create the `kembar_db` database.
   - Create all necessary tables (`categories`, `sandals`, `stock_in`, `stock_sold`).
   - Insert sample seed data.

## 4. Environment Variables
Create a `.env.local` file in the root directory with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=kembar_db
```

## 5. Running the Application
Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Documentation
- **Categories**: Manage product categories.
- **Sandals**: Manage individual sandal items (SKUs).
- **Stock In**: Record incoming stock.
- **Stock Sold**: Record sales. Includes automatic stock validation (cannot sell more than available).
- **Reports**: View overall inventory status and export to CSV, Excel, or PDF.
