import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { StatusRoutingModule } from './status-routing.module';
import { StatusComponent } from './status.component';

@NgModule({
  imports: [
    CommonModule,
    StatusRoutingModule,
    QRCodeComponent,
  ],
  declarations: [StatusComponent]
})
export class StatusModule { }
