import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { AppComponent } from './app/app.component';

// Register Chart.js components
Chart.register(...registerables);

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter([])
  ]
}).catch(err => console.error(err));
