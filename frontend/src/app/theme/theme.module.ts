import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from './theme.service';
import { ThemeSwitcherComponent } from './theme-switcher/theme-switcher.component';
import { ThemeConfigComponent } from './theme-config/theme-config.component';

@NgModule({
  declarations: [
    ThemeSwitcherComponent,
    ThemeConfigComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ThemeSwitcherComponent,
    ThemeConfigComponent
  ],
  providers: [
    ThemeService
  ]
})
export class ThemeModule { }
