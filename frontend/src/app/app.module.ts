import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ThemeModule } from './theme/theme.module';
import { AuthModule } from './features/auth/auth.module';
import { TeamModule } from './features/team/team.module';
import { ReportModule } from './features/report/report.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
    CoreModule,
    SharedModule,
    ThemeModule,
    AuthModule,
    TeamModule,
    ReportModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
