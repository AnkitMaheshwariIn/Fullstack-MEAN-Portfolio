import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThemeConfig } from './theme-config';

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  font: string;
  borderRadius: string;
  boxShadow: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>({
    primary: '#4285f4',
    secondary: '#34a853',
    accent: '#fbbc05',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#202124',
    font: 'Roboto, sans-serif',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  });

  constructor() {
    this.loadTheme();
  }

  get currentTheme(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.saveTheme(theme);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.themeSubject.next(JSON.parse(savedTheme));
    }
  }

  private saveTheme(theme: Theme): void {
    localStorage.setItem('theme', JSON.stringify(theme));
  }

  getThemeConfig(): ThemeConfig {
    return {
      primary: {
        label: 'Primary Color',
        value: this.themeSubject.value.primary,
        options: [
          '#4285f4', '#34a853', '#fbbc05', '#ea4335', '#1a73e8'
        ]
      },
      secondary: {
        label: 'Secondary Color',
        value: this.themeSubject.value.secondary,
        options: [
          '#34a853', '#fbbc05', '#ea4335', '#4285f4', '#1a73e8'
        ]
      },
      accent: {
        label: 'Accent Color',
        value: this.themeSubject.value.accent,
        options: [
          '#fbbc05', '#ea4335', '#4285f4', '#34a853', '#1a73e8'
        ]
      },
      borderRadius: {
        label: 'Border Radius',
        value: this.themeSubject.value.borderRadius,
        options: ['4px', '8px', '12px', '16px']
      },
      boxShadow: {
        label: 'Box Shadow',
        value: this.themeSubject.value.boxShadow,
        options: [
          '0 2px 4px rgba(0,0,0,0.1)',
          '0 4px 8px rgba(0,0,0,0.15)',
          '0 8px 16px rgba(0,0,0,0.2)',
          'none'
        ]
      }
    };
  }
}
