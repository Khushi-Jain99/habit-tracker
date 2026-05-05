import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PreferencesStateV1 {
  version: 1;
  notifications: {
    enabled: boolean;
    permission: NotificationPermission | 'unsupported';
  };
  sound: {
    enabled: boolean;
  };
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly KEY = 'habitflow_preferences_v1';

  private readonly defaultState: PreferencesStateV1 = {
    version: 1,
    notifications: {
      enabled: false,
      permission: 'unsupported'
    },
    sound: {
      enabled: true
    },
    updatedAt: new Date().toISOString()
  };

  private stateSubject = new BehaviorSubject<PreferencesStateV1>(this.defaultState);
  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        // Initialize permission status at first load.
        const permission: PreferencesStateV1['notifications']['permission'] =
          typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        this.stateSubject.next({
          ...this.defaultState,
          notifications: { ...this.defaultState.notifications, permission }
        });
        return;
      }

      const parsed = JSON.parse(raw) as PreferencesStateV1;
      this.stateSubject.next({
        ...this.defaultState,
        ...parsed,
        notifications: {
          ...this.defaultState.notifications,
          ...(parsed.notifications ?? {})
        },
        sound: {
          ...this.defaultState.sound,
          ...(parsed.sound ?? {})
        }
      });
    } catch {
      this.stateSubject.next(this.defaultState);
    }
  }

  private persist(): void {
    const state = this.stateSubject.value;
    localStorage.setItem(this.KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  }

  getSnapshot(): PreferencesStateV1 {
    return this.stateSubject.value;
  }

  setNotificationsEnabled(enabled: boolean): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      notifications: { ...this.stateSubject.value.notifications, enabled }
    });
    this.persist();
  }

  setNotificationPermission(permission: NotificationPermission | 'unsupported'): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      notifications: { ...this.stateSubject.value.notifications, permission }
    });
    this.persist();
  }

  setSoundEnabled(enabled: boolean): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      sound: { ...this.stateSubject.value.sound, enabled }
    });
    this.persist();
  }
}

