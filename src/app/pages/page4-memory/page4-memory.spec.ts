import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Page4Memory } from './page4-memory';

describe('Page4Memory', () => {
  let component: Page4Memory;
  let fixture: ComponentFixture<Page4Memory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page4Memory],
    }).compileComponents();

    fixture = TestBed.createComponent(Page4Memory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
