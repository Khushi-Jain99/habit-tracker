# 🚀 Quick Start Guide - Habit Tracker

## Step-by-Step Installation

### 1. Prerequisites Check

Before starting, ensure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**

Check your versions:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### 2. Navigate to Project

Open PowerShell or Command Prompt:

```powershell
cd "c:\Users\HP\Desktop\PROJECTS\Habit Tracker"
```

### 3. Install Dependencies

Run the following command (this may take 2-5 minutes):

```bash
npm install
```

**What this does:** Downloads all required packages (Angular, Material, Chart.js, etc.)

### 4. Start the Application

```bash
npm start
```

**What you'll see:**

- Building the application (30-60 seconds first time)
- Message: "Local: http://localhost:4200/"
- Browser should open automatically

If browser doesn't open, manually go to: **http://localhost:4200**

### 5. Explore the App

You should now see:

- ✅ Modern dashboard with gradient background
- ✅ 8 pre-loaded sample habits
- ✅ Interactive monthly grid
- ✅ Beautiful charts (Daily, Weekly, Overall)
- ✅ Top 5 habits ranking
- ✅ Mood & Motivation tracker

---

## 🎯 First Steps After Launch

### 1. Toggle Dark Mode

- Click the moon/sun icon in the top-right corner
- Your preference is automatically saved

### 2. Track Your First Habit

- Find the monthly grid with calendar view
- Click any checkbox to mark a habit as completed
- Notice the streak counter updates automatically

### 3. Add Your Own Habit

- Click the **"Add Habit"** button above the monthly grid
- Choose an emoji icon (32 options)
- Select a color (18 options)
- Set your monthly goal (1-31 days)
- Click **"Add Habit"**

### 4. Edit or Delete Habits

- Click the ⋮ (three dots) menu next to any habit
- Select "Edit" to modify or "Delete" to remove

### 5. View Analytics

- Scroll through the dashboard to see:
  - **Daily Progress**: Bar chart showing daily completion rates
  - **Weekly Progress**: Weekly aggregated stats
  - **Overall Stats**: Pie chart of total progress
  - **Top 5 Habits**: Your most consistent habits ranked
  - **Mood Tracker**: 30-day mood and motivation trends

### 6. Change Month/Year

- Use the dropdown selectors at the top of the dashboard
- All charts and data update automatically

---

## ⚡ Quick Commands Reference

| Command         | What It Does                      |
| --------------- | --------------------------------- |
| `npm start`     | Start development server          |
| `npm run build` | Create production build           |
| `npm run watch` | Build and auto-rebuild on changes |
| `Ctrl + C`      | Stop the development server       |

---

## 🔧 Troubleshooting

### Issue: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue: Port 4200 already in use

**Solution:** Either:

1. Stop other Angular apps running
2. Or use a different port:
   ```bash
   ng serve --port 4300
   ```

### Issue: Build errors after `npm install`

**Solution:**

1. Delete `node_modules` folder and `package-lock.json`
2. Run `npm install` again
3. If still failing, try `npm cache clean --force` first

### Issue: Charts not displaying

**Solution:**

1. Hard refresh the browser (Ctrl + Shift + R)
2. Clear browser cache
3. Check browser console for errors (F12)

### Issue: Dark mode not working

**Solution:**

- Clear browser's LocalStorage
- Refresh the page
- Toggle dark mode again

---

## 📱 Browser Compatibility

✅ **Recommended Browsers:**

- Chrome 90+ (Best performance)
- Edge 90+
- Firefox 88+
- Safari 14+

⚠️ **Not Supported:**

- Internet Explorer (deprecated)

---

## 🎨 Customization Tips

### Change Theme Colors

Edit `src/styles.scss`:

```scss
.app-container {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### Add More Emoji Icons

Edit `src/app/components/habit-dialog/habit-dialog.component.ts`:

```typescript
icons = [
  "⏰",
  "🧘",
  "🚿",
  "💼", // Add your emojis here
];
```

### Modify Sample Data

Edit `src/app/services/habit.service.ts` in the `initializeSampleData()` method.

---

## 💾 Data Storage

- **Where is data stored?** Browser's LocalStorage
- **Is it synced?** No, data is local to your browser
- **How to backup?** Data export feature (coming soon)
- **Reset data:** Clear browser's LocalStorage for `localhost:4200`

---

## 🚀 Building for Production

To create an optimized production build:

```bash
npm run build
```

Production files will be in: `dist/habit-tracker/`

Deploy to:

- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting
- Any static hosting service

---

## 📖 Learn More

- **Angular Docs:** https://angular.io/docs
- **Material Design:** https://material.angular.io/
- **Chart.js:** https://www.chartjs.org/docs/

---

## 🎉 You're All Set!

Enjoy tracking your habits and building better routines! 🌟

For issues or questions, refer to the main [README.md](README.md) file.

**Happy habit building!** 💪✨
