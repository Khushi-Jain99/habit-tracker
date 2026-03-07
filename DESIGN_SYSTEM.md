# 🎨 Design System & Style Guide

## Color Palette

### Primary Colors

```scss
$primary-purple: #667eea;
$primary-deep-purple: #764ba2;
$accent-light-purple: #a8b3ff;
$accent-light-magenta: #c79fff;
```

### Habit Colors (18 options)

```scss
$habit-red: #ff6b6b;
$habit-teal: #4ecdc4;
$habit-blue: #45b7d1;
$habit-green: #96ceb4;
$habit-yellow: #ffeaa7;
$habit-gray: #dfe6e9;
$habit-light-blue: #74b9ff;
$habit-pink: #fd79a8;
$habit-orange: #fdcb6e;
$habit-purple: #6c5ce7;
$habit-lavender: #a29bfe;
$habit-coral: #ff7675;
$habit-mint: #00b894;
$habit-cyan: #00cec9;
$habit-royal-blue: #0984e3;
$habit-cool-gray: #b2bec3;
$habit-gold: #fdcb6e;
$habit-rose: #fd79a8;
```

### Background Gradients

#### Light Mode

```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### Dark Mode

```scss
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
```

#### Card Light

```scss
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
```

#### Card Dark

```scss
background: rgba(26, 26, 46, 0.95);
backdrop-filter: blur(10px);
```

## Typography

### Font Family

```scss
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  sans-serif;
```

### Heading Sizes

```scss
h1: 28px (Desktop), 22px (Mobile)
h2: 24px (Desktop), 20px (Mobile)
h3: 20px (Desktop), 18px (Mobile)
h4: 18px (Desktop), 16px (Mobile)
Body: 16px (Desktop), 14px (Mobile)
Small: 14px (Desktop), 12px (Mobile)
```

### Font Weights

```scss
Light: 300
Regular: 400
Medium: 500
SemiBold: 600
Bold: 700
ExtraBold: 800
```

## Spacing System

### Scale (8px base)

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
$spacing-3xl: 64px;
```

### Component Spacing

- Card padding: 20px
- Grid gap: 20px
- Button padding: 0 20px
- Icon gap: 8-12px

## Border Radius

### Scale

```scss
$radius-sm: 8px; // Small buttons
$radius-md: 12px; // Buttons, inputs
$radius-lg: 16px; // Stat cards
$radius-xl: 20px; // Main cards
$radius-full: 50%; // Circles
```

## Shadows

### Light Mode

```scss
// Subtle
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

// Medium (default cards)
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

// Hover
box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);

// Accent
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
```

### Dark Mode

```scss
// Subtle
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

// Medium
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

// Hover
box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
```

## Components

### Buttons

#### Primary Button

```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 12px 24px;
border-radius: 12px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

&:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}
```

#### Icon Button

```scss
width: 40px;
height: 40px;
border-radius: 50%;
color: #999;

&:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}
```

### Cards

#### Main Card

```scss
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
padding: 20px;
transition: transform 0.3s ease;

&:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}
```

#### Stat Card

```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
padding: 20px;
color: white;
```

### Inputs

#### Text Field

```scss
border: 2px solid #e0e0e0;
border-radius: 12px;
padding: 12px 16px;
font-size: 16px;

&:focus {
  border-color: #667eea;
  outline: none;
}
```

### Checkboxes (Habit Grid)

#### Empty State

```scss
width: 32px;
height: 32px;
border: 2px solid #ddd;
border-radius: 8px;
background: white;
```

#### Completed State

```scss
background: var(--habit-color);
border-color: var(--habit-color);
```

#### Hover

```scss
border-color: var(--habit-color);
transform: scale(1.1);
```

### Progress Bars

#### Standard

```scss
height: 8px;
border-radius: 4px;
background: rgba(0, 0, 0, 0.1);

.fill {
  background: #667eea;
  border-radius: 4px;
}
```

### Badges

#### Streak Badge

```scss
background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
color: white;
padding: 4px 12px;
border-radius: 20px;
font-weight: 600;
font-size: 14px;
box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
```

#### Rank Badge

```scss
width: 40px;
height: 40px;
border-radius: 50%;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
font-weight: 700;
font-size: 18px;
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
```

## Animations

### Transitions

```scss
// Standard
transition: all 0.2s ease;

// Smooth
transition: all 0.3s ease;

// Color only
transition:
  color 0.2s ease,
  background 0.2s ease;

// Transform only
transition: transform 0.3s ease;
```

### Keyframes

#### Fade In

```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Bounce

```scss
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
```

#### Sparkle

```scss
@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
}
```

#### Spin

```scss
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

## Responsive Breakpoints

```scss
// Mobile
@media (max-width: 768px) {
}

// Tablet
@media (min-width: 769px) and (max-width: 1200px) {
}

// Desktop
@media (min-width: 1201px) {
}

// Large Desktop
@media (min-width: 1441px) {
}
```

## Icons

### Material Icons

- Used throughout the app
- Size: 20-28px
- Weight: 400
- Fill: Outlined style

### Emoji Icons

- Size: 14-32px
- Used for habit icons
- Cross-platform compatible

## Charts

### Chart.js Configuration

#### Colors

```javascript
backgroundColor: 'rgba(102, 126, 234, 0.6)',
borderColor: 'rgba(102, 126, 234, 1)',
borderWidth: 2,
```

#### Grid

```javascript
grid: {
  color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
}
```

#### Text

```javascript
color: isDark ? "#e0e0e0" : "#333";
```

## Accessibility

### Focus States

```scss
&:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

### Color Contrast

- Text on white: Minimum 4.5:1
- Text on purple: Use white or very light colors
- Links: Minimum 3:1 against background

### Touch Targets

- Minimum: 44x44px
- Recommended: 48x48px
- Mobile buttons: 48x48px minimum

## Best Practices

### 1. Use Design Tokens

Always use variables/constants for:

- Colors
- Spacing
- Border radius
- Font sizes

### 2. Maintain Consistency

- Same hover effects throughout
- Consistent spacing scale
- Uniform border radius
- Matching shadows

### 3. Performance

- Use `transform` over position properties
- Use `opacity` for fade effects
- Avoid animating `width` and `height`
- Use `will-change` sparingly

### 4. Dark Mode

- Test all colors in both themes
- Ensure sufficient contrast
- Use semi-transparent overlays
- Adjust shadow intensity

### 5. Responsive Design

- Mobile-first approach
- Test on real devices
- Consider touch interactions
- Optimize for portrait and landscape

---

**This design system ensures consistency across the entire Habit Tracker application.**
