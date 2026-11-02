import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Page3Create } from './page3-create';

describe('Page3Create', () => {
  let component: Page3Create;
  let fixture: ComponentFixture<Page3Create>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [Page3Create],
    }).compileComponents();

    fixture = TestBed.createComponent(Page3Create);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
