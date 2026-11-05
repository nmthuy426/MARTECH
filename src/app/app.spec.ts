import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('provides the previous campaign step on every page except Home', () => {
    const app = TestBed.createComponent(App).componentInstance;
    for (const [path, target] of [['/home', null], ['/choose-memory', '/home'], ['/create-memory', '/choose-memory'], ['/memory-card', '/create-memory'], ['/recommended-toys', '/memory-card'], ['/gallery', '/home']] as const) {
      app.currentPath.set(path);
      expect(app.backPath()).toBe(target);
    }
    app.campaignPath.set('/gallery');app.currentPath.set('/admin');
    expect(app.backPath()).toBe('/gallery');
  });

  it('should render the routed view', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
