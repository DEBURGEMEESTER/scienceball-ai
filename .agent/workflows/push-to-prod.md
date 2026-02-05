---
description: How to push changes to GitHub and deploy to Railway
---

Follow these steps to synchronize your local code with the production environment on Railway.

### 1. Open Terminal
Open your **MINGW64** or **Git Bash** terminal.

### 2. Navigate to Project
Ensure you are in the root directory of your project:
```bash
cd ~/Desktop/Programmeerprojectjes/ScienceBall.ai
```

### 3. Stage Changes
Add all modified and new files to the staging area:
```bash
git add .
```

### 4. Commit Changes
Create a snapshot of your changes with a descriptive message:
```bash
git commit -m "Update UI and fix production connectivity"
```

### 5. Push to GitHub
Upload your local commits to the remote repository:
```bash
git push
```

### 6. Verify Deployment
Go to your [Railway Dashboard](https://railway.app/dashboard) to monitor the build and deployment progress. Once completed, refresh your live site to see the changes.
