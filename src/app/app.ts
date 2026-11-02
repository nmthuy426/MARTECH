import { Component, signal, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MarTechService } from './services/martech-service';
@Component({imports:[RouterOutlet, RouterLink],selector:'app-root',styleUrl:'./app.css',templateUrl:'./app.html'})
export class App {
 protected readonly title = signal('toys_we_remember_micorsite');
 readonly isDemo = signal(false);
 readonly campaignPath = signal(sessionStorage.getItem('ttwr.campaign_path') || '/page1');
 private readonly tracking = inject(MarTechService);
 constructor() {
  inject(Router).events.subscribe(event=>{
   if (event instanceof NavigationEnd) {
    const path=event.urlAfterRedirects.split('?')[0];
    const demo = path === '/admin';
    this.isDemo.set(demo);
    if (!demo) {
      this.campaignPath.set(event.urlAfterRedirects);
      sessionStorage.setItem('ttwr.campaign_path', event.urlAfterRedirects);
      this.tracking.enterCustomerPage(path);
    }
   }
  });
 }
}
