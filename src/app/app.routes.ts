import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Publicaciones } from './pages/publicaciones/publicaciones';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'publicaciones', component: Publicaciones },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
