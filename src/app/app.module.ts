import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MfgtService } from 'app/shared/services/mfgtService';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent, SidebarComponent } from 'app/shared';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SidebarComponent,
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: TranslateHttpLoader,
            }
        }),
    ],
    providers: [
        MfgtService,
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule { }
