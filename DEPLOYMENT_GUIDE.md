# iWood Application - Standalone Deployment Guide

## Quick Package for Windows

To create a standalone executable for Windows:

```bash
npm run package-win
```

This will create a `build/` folder with a Windows executable.

## Package for All Platforms

To create executables for Windows, Linux, and macOS:

```bash
npm run package-all
```

## What Gets Packaged

The standalone application includes:
- ✅ Node.js runtime (embedded)
- ✅ All application code and dependencies
- ✅ Web interface (HTML, CSS, JavaScript)
- ✅ Database connection capabilities
- ✅ All necessary files to run the application

## System Requirements

**Target Computer Needs:**
- Windows 10/11 (64-bit)
- MySQL Server installed and running
- Network access (if accessing MySQL remotely)

## Deployment Steps

### 1. Package the Application
```bash
npm run package-win
```

### 2. Copy Files to Target Computer
Copy the entire `build/` folder to the target computer, including:
- `iwood-slim-local-app.exe` (main executable)
- `public/` folder (web interface)
- `views/` folder (templates)
- `.env` file (configuration)

### 3. Setup Database on Target Computer
- Install MySQL Server
- Create database and user
- Import database schema using provided SQL files

### 4. Configure Database Connection
Edit the `.env` file with target computer's database settings:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=iwood_user
DB_PASSWORD=iwood_password
DB_NAME=iwood_db
PORT=3000
```

### 5. Run the Application
Double-click `iwood-slim-local-app.exe` or run from command prompt:
```cmd
iwood-slim-local-app.exe
```

### 6. Access the Application
Open a web browser and go to: `http://localhost:3000`

## Alternative: Simple Copy Deployment

If you prefer not to create executables, you can also:

1. Install Node.js on the target computer
2. Copy your entire project folder
3. Run `npm install` on the target computer
4. Run `npm start` to start the application

## Database Setup Files

Include these SQL files for database setup:
- `00_master_setup.sql`
- `01_create_tables.sql`
- `02_create_triggers.sql`
- `03_create_procedures.sql`
- `04_create_views.sql`
- `05_test_data.sql` (optional)

## Troubleshooting

**If the executable won't start:**
- Check that all files are in the same directory
- Verify MySQL is running
- Check `.env` file settings
- Run from command prompt to see error messages

**If can't connect to database:**
- Verify MySQL service is running
- Check database credentials in `.env`
- Ensure database and user exist
- Test database connection manually
