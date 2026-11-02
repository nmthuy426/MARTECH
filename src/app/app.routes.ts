import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Page1IntroComponent } from './pages/page1-intro/page1-intro';
import { Page2Select } from './pages/page2-select/page2-select';
import { Page3Create } from './pages/page3-create/page3-create';
import { Page4Memory } from './pages/page4-memory/page4-memory';
import { Page5Product } from './pages/page5-product/page5-product';

export const routes: Routes = [
  { path: 'admin', loadComponent: () => import('./pages/admin/admin').then(m => m.Admin) },
  // Mặc định khi vào trang chủ -> mở page 1
  { path: '', redirectTo: 'page1', pathMatch: 'full' },

  // Khai báo đường dẫn tương ứng với từng component
  { path: 'page1', component: Page1IntroComponent },
  { path: 'page1-intro', redirectTo: 'page1', pathMatch: 'full' },
  { path: 'page2', component: Page2Select },
  { path: 'page3', component: Page3Create },
  { path: 'page4', component: Page4Memory },
  { path: 'page5', component: Page5Product },

  // Trang không tồn tại -> quay về page 1
  { path: '**', redirectTo: 'page1' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
//