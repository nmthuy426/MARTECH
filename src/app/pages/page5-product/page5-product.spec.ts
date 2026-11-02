import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Page5Product } from './page5-product';

describe('Page5Product', () => {
  let component: Page5Product;
  let fixture: ComponentFixture<Page5Product>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [Page5Product],
    }).compileComponents();

    fixture = TestBed.createComponent(Page5Product);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
