# iWood Application Update Guide

## 🔄 How to Update to a New Version

### Quick Update Process:
1. **Download** the new version zip file from GitHub Releases
2. **Stop** the current application (close the command window)
3. **Backup your settings** - Copy your `.env` file to a safe location
4. **Extract** the new version to your iWood folder (replace old files)
5. **Restore your settings** - Copy your `.env` file back
6. **Start** the application with `start-iwood.bat`

### What Gets Preserved:
- ✅ **Your database** - All customer data, orders, inventory stays intact
- ✅ **Your settings** - `.env` configuration preserved
- ✅ **Your customizations** - Any local changes you've made

### What Gets Updated:
- 🆕 **Application executable** - New features and bug fixes
- 🆕 **Web interface** - Updated HTML/CSS/JavaScript
- 🆕 **Documentation** - Latest guides and help files

### Database Updates:
Some updates may include database changes. Check the release notes for:
- New SQL migration files (run these after updating)
- Updated procedures or views
- New configuration options

---

**Important:** Your data is safe! The application and database are separate - updating the app won't affect your stored information.
