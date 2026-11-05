import { Router, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MemoryThemeId } from '../../models/martech-events.model';
import { MarTechService } from '../../services/martech-service';
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

  it('continues immediately with the clicked theme and records each event once', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const track = vi.spyOn(TestBed.inject(MarTechService), 'trackEvent');
    fixture.nativeElement.querySelector('[data-theme-id="outdoor-kite"]').click();
    expect(sessionStorage.getItem('theme_id')).toBe(MemoryThemeId.CANH_DIEU);
    expect(navigate).toHaveBeenCalledWith(['/create-memory']);
    expect(track.mock.calls.filter(c => c[0] === 'memory_theme_select')).toHaveLength(1);
    expect(track.mock.calls.filter(c => c[0] === 'story_form_open')).toHaveLength(1);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
