import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Page2Select } from './page2-select';

describe('Page2Select', () => {
  let component: Page2Select;
  let fixture: ComponentFixture<Page2Select>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [Page2Select],
    }).compileComponents();

    fixture = TestBed.createComponent(Page2Select);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
