import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared';

const routes: Routes = [
    { path: 'status', loadChildren: './status/status.module#StatusModule' },
    { path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' },
    //{ path: '', redirectTo: 'status' },
    { path: '**', redirectTo: 'not-found' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
