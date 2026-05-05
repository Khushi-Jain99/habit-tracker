import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HabitsComponent } from './components/habits/habits.component';
import { AddHabitComponent } from './components/add-habit/add-habit.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
	{ path: '', component: DashboardComponent },
	{ path: 'habits', component: HabitsComponent },
	{ path: 'add-habit', component: AddHabitComponent },
	{ path: 'analytics', component: AnalyticsComponent },
	{ path: 'profile', component: ProfileComponent },
	{ path: '**', redirectTo: '' }
];
