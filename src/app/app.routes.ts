import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HabitsComponent } from './components/habits/habits.component';
import { AddHabitComponent } from './components/add-habit/add-habit.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { authGuard, redirectIfLoggedInGuard } from './services/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'signup', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent, canActivate: [redirectIfLoggedInGuard] },
	{ path: 'habits', component: HabitsComponent },
	{ path: 'add-habit', component: AddHabitComponent },
	{ path: 'analytics', component: AnalyticsComponent },
	{ path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: '' }
];
