import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared';
import { StatusComponent } from './status/status.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
    {
        path: 'status',
        loadChildren: () => import('./status/status.module').then((m) => m.StatusModule)
    },
    {
        path: 'not-found',
        loadChildren: () => import('./not-found/not-found.module').then((m) => m.NotFoundModule)
    },

    // { path: '', redirectTo: 'status' },
    { path: '**', redirectTo: 'not-found' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
