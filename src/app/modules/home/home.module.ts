import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    WelcomeComponent,

  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    TranslateModule,
  ],
})
export class HomeModule {}
