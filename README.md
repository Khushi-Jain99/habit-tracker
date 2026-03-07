# 🌟 Modern Habit Tracker

A beautiful, feature-rich habit tracking application built with Angular 17, featuring a modern card-based design, interactive charts, and dark mode support.

![Habit Tracker](https://img.shields.io/badge/Angular-17-red)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 📊 Dashboard & Analytics

- **Daily Progress Chart** - Track your daily habit completion rates
- **Weekly Progress Chart** - View weekly trends at a glance
- **Overall Statistics** - Pie chart showing completed vs remaining tasks
- **Top 5 Habits Ranking** - See your most consistent habits
- **Progress Analytics Panel** - Real-time stats with goal tracking

### 🎯 Habit Management

- **Interactive Monthly Grid** - Visual calendar view with clickable checkboxes
- **Habit Streak Counter** - Track current and longest streaks
- **Color-coded Habits** - Personalize each habit with icons and colors
- **Easy CRUD Operations** - Add, edit, and delete habits effortlessly
- **Goal Setting** - Set custom monthly goals for each habit

### 📈 Mood & Motivation Tracking

- **Dual-line Chart** - Track both mood and motivation levels (1-10 scale)
- **30-day History** - View trends over the past month
- **Visual Insights** - Spot patterns in your emotional well-being

### 🎨 Modern UI/UX

- **Card-based Layout** - Clean, organized dashboard design
- **Smooth Animations** - Hover effects and transitions throughout
- **Light & Dark Mode** - Toggle between themes with one click
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Gradient Aesthetics** - Beautiful color schemes and soft shadows
- **Material Design** - Built with Angular Material components

### 💾 Data Persistence

- **LocalStorage Integration** - All data saved automatically
- **Sample Data Included** - Pre-populated habits for quick start
- **Import/Export Ready** - Easy data management (future feature)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd "c:\Users\HP\Desktop\PROJECTS\Habit Tracker"
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:4200
   ```

## 🛠️ Built With

- **Angular 17** - Modern web framework with standalone components
- **Angular Material** - Material Design components
- **Chart.js & ng2-charts** - Beautiful, responsive charts
- **TypeScript** - Type-safe development
- **SCSS** - Advanced styling with variables and mixins
- **RxJS** - Reactive programming for state management

## 📁 Project Structure

```
habit-tracker/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/         # Main dashboard component
│   │   │   └── habit-dialog/      # Habit add/edit dialog
│   │   ├── models/
│   │   │   └── habit.model.ts     # Data models and interfaces
│   │   ├── services/
│   │   │   ├── habit.service.ts   # Habit management logic
│   │   │   └── theme.service.ts   # Theme switching logic
│   │   └── app.component.ts       # Root component
│   ├── styles.scss                 # Global styles
│   ├── index.html                  # Main HTML file
│   └── main.ts                     # Application entry point
├── angular.json                    # Angular configuration
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript configuration
```

## 🎯 Usage Guide

### Adding a New Habit

1. Click the "Add Habit" button (if implemented) or modify the sample data
2. Choose an icon (32 emoji options available)
3. Select a color (18 color options)
4. Set your monthly goal (1-31 days)
5. Click "Save"

### Tracking Daily Progress

1. Navigate to the monthly grid
2. Click on any checkbox to mark a habit as completed for that day
3. Watch your streak counter update in real-time
4. View your progress in the charts above

### Viewing Analytics

- **Daily Progress**: Bar chart showing completion % for each day
- **Weekly Progress**: Aggregated weekly completion rates
- **Overall Stats**: Doughnut chart showing total completion vs remaining
- **Top Habits**: Ranked list of your most consistent habits

### Switching Themes

- Click the moon/sun icon toggle in the header
- Theme preference is saved to LocalStorage

## 🎨 Customization

### Changing Colors

Edit the color palette in `habit-dialog.component.ts`:

```typescript
colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1", // Add your colors
];
```

### Adding More Icons

Extend the icon list in `habit-dialog.component.ts`:

```typescript
icons = [
  "⏰",
  "🧘",
  "🚿", // Add more emojis
];
```

### Modifying Chart Colors

Update chart configurations in `dashboard.component.ts`:

```typescript
backgroundColor: 'rgba(102, 126, 234, 0.6)',
borderColor: 'rgba(102, 126, 234, 1)',
```

## 🌈 Theme Colors

### Light Theme

- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Deep Purple)
- Background: Gradient from `#667eea` to `#764ba2`

### Dark Theme

- Primary: `#a8b3ff` (Light Purple)
- Secondary: `#c79fff` (Light Magenta)
- Background: Gradient from `#1a1a2e` to `#16213e`

## 📱 Responsive Breakpoints

- **Desktop**: > 1200px - Full multi-column layout
- **Tablet**: 768px - 1200px - Adjusted grid columns
- **Mobile**: < 768px - Single column, optimized touch targets

## 🔧 Available Scripts

- `npm start` - Start development server (port 4200)
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests (if configured)

## 📊 Sample Data

The app comes pre-loaded with 8 sample habits:

- Wake up at 06:00 ⏰
- Meditation 🧘
- Cold Shower 🚿
- Work 💼
- Read 10 pages 📚
- No sugar 🍬
- No alcohol 🍺
- GYM 💪

All with realistic completion histories and varying completion rates.

## 🚀 Future Enhancements

- [ ] Habit categories and filtering
- [ ] Data export (CSV, JSON)
- [ ] Habit notes and journaling
- [ ] Reminder notifications
- [ ] Social features (share progress)
- [ ] Advanced analytics and insights
- [ ] Backend integration with REST API
- [ ] User authentication
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by Notion, Habitify, and modern productivity apps
- Icons: Emoji characters (cross-platform compatible)
- Charts: Chart.js library
- UI Framework: Angular Material
- Design: Material Design principles

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainer.

---

**Built with ❤️ using Angular**

Happy habit tracking! 🎯✨
