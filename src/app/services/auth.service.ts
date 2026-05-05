import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UserRecord } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private userService: UserService) {}

  async signup(name: string, email: string, password?: string, seedHabits: boolean = true): Promise<UserRecord> {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = this.userService.getUsers().find((user) => user.email === trimmedEmail);
    if (existing) {
      throw new Error('Account already exists for this email.');
    }

    const habits = seedHabits ? this.userService.createDefaultHabits() : [];
    const user = this.userService.createUser(name, trimmedEmail, password, habits);
    await this.simulateDelay();
    return user;
  }

  async login(email: string, password?: string): Promise<UserRecord> {
    const trimmedEmail = email.trim().toLowerCase();
    const match = this.userService.getUsers().find((user) => user.email === trimmedEmail);
    await this.simulateDelay();

    if (!match) {
      throw new Error('No account found for this email.');
    }

    if (match.password && password !== match.password) {
      throw new Error('Incorrect password.');
    }

    this.userService.setCurrentUser(match.id);
    return match;
  }

  async logout(): Promise<void> {
    this.userService.logout();
    await this.simulateDelay(120);
  }

  private simulateDelay(ms = 350): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
}
