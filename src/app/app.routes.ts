import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.Login) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register').then(m => m.Register) 
  },
  { 
    path: 'posts', 
    loadComponent: () => import('./pages/publicaciones/publicaciones').then(m => m.Publicaciones),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./pages/profiles/profiles').then(m => m.Profiles),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil').then(m => m.MiPerfil),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: '**', redirectTo: '/posts' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}