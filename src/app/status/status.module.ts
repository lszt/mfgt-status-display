import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StatusRoutingModule } from './status-routing.module';
import { StatusComponent } from './status.component';

@NgModule({
  imports: [
    CommonModule,
    StatusRoutingModule
  ],
  declarations: [StatusComponent]
})
export class StatusModule { }
