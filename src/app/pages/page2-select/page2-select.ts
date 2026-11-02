import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemoryThemeId } from '../../models/martech-events.model';
import { MarTechService } from '../../services/martech-service';

@Component({
  selector: 'app-page2-select',
  templateUrl: './page2-select.html',
  styleUrl: './page2-select.css',
  imports: [CommonModule, RouterLink],
})
export class Page2Select implements OnInit {
  MemoryThemeId = MemoryThemeId;
  currentSelectedId: MemoryThemeId = MemoryThemeId.GACH_LEGO;

  constructor(
    private router: Router,
    private marTechService: MarTechService,
  ) {}

  ngOnInit(): void {
    const savedTheme = sessionStorage.getItem('theme_id');
    if (savedTheme && Object.values(MemoryThemeId).includes(savedTheme as MemoryThemeId)) {
      this.currentSelectedId = savedTheme as MemoryThemeId;
    }
  }

  private themeSelected = false;

  selectCard(themeId: MemoryThemeId): void {
    this.themeSelected = true;
    this.currentSelectedId = themeId;
    sessionStorage.setItem('theme_id', themeId);

    this.marTechService.trackEvent('memory_theme_select', {
      theme_id: themeId,
    });
  }

  goToPage3(): void {
    if (!this.themeSelected) this.selectCard(this.currentSelectedId);
    sessionStorage.setItem('theme_id', this.currentSelectedId);

    this.marTechService.trackEvent('story_form_open', {
      theme_id: this.currentSelectedId,
    });

    this.router.navigate(['/page3']);
  }
}