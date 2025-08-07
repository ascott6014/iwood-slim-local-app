# iWood Slim Local Application - Installation Guide

## Overview
This is a standalone inventory and order management system that runs locally on any Windows computer without requiring Node.js, npm, or any development tools to be installed.

## 🖥️ System Requirements
- **Operating System:** Windows 10/11 (64-bit)
- **Database:** MySQL 8.0+ or MariaDB 10.6+
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Storage:** 500MB free space
- **Network:** Internet connection for initial setup only

## 📦 Quick Installation

### Option 1: Download Pre-built Release (Recommended)
1. Go to the [Releases page](https://github.com/ascott6014/iwood-slim-local-app/releases)
2. Download the latest `iwood-slim-local-app-windows.zip`
3. Extract to your desired folder (e.g., `C:\iWoodApp\`)
4. Follow the [Database Setup](#database-setup) steps below
5. Run `start-iwood.bat` to launch the application

### Option 2: Build from Source
```bash
git clone https://github.com/ascott6014/iwood-slim-local-app.git
cd iwood-slim-local-app
npm install
npm run dist
```
The built application will be in the `build/` folder.

## 🗄️ Database Setup

### Step 1: Install MySQL
1. Download MySQL 8.0+ from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Install with default settings
3. Remember the root password you set during installation

### Step 2: Create Database
1. Open MySQL Command Line Client or MySQL Workbench
2. Run the SQL files in this order:
   ```sql
   -- Run these files from the application folder:
   source 00_master_setup.sql;
   source 01_create_tables.sql;
   source 02_create_triggers.sql;
   source 03_create_procedures.sql;
   source 04_create_views.sql;
   source 05_test_data.sql;
   ```

### Step 3: Configure Database Connection
1. Open the `.env` file in the application folder
2. Update the database settings:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=iwood_inventory
   ```

## 🚀 Running the Application

### First Time Setup
1. Double-click `start-iwood.bat`
2. Wait for "Server is running on http://localhost:3000"
3. Open your web browser to `http://localhost:3000`
4. The application should load successfully

### Daily Use
- Simply double-click `start-iwood.bat` to start
- Close the command window to stop the application
- Access via `http://localhost:3000` in any web browser

## 🔧 Troubleshooting

### Application Won't Start
- Check that MySQL service is running
- Verify database credentials in `.env` file
- Ensure port 3000 is not in use by another application

### Database Connection Errors
- Confirm MySQL is installed and running
- Check username/password in `.env` file
- Verify database `iwood_inventory` exists

### Cannot Access in Browser
- Confirm the application started without errors
- Try `http://127.0.0.1:3000` instead
- Check Windows Firewall settings

## 📁 File Structure
```
iwood-slim-local-app/
├── iwood-slim-local-app.exe    # Main application
├── start-iwood.bat             # Easy launcher
├── .env                        # Database configuration
├── public/                     # Web assets (CSS, JS, HTML)
├── views/                      # Page templates
├── *.sql                       # Database setup files
└── DEPLOYMENT_GUIDE.md         # Additional documentation
```

## 🔒 Security Notes
- The application runs locally only (not accessible from internet)
- Database credentials are stored in `.env` file
- Change default passwords before production use
- Regular database backups recommended

## 📞 Support
For issues or questions:
1. Check the troubleshooting section above
2. Review logs in the command window
3. Create an issue on the GitHub repository
