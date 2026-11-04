import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Page1IntroComponent } from './page1-intro';

describe('Page1IntroComponent', () => {
  let component: Page1IntroComponent;
  let fixture: ComponentFixture<Page1IntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page1IntroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Page1IntroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

