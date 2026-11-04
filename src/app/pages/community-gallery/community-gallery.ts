import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarTechService } from '../../services/martech-service';
import { COMMUNITY_MEMORIES, CommunityMemory } from './community-gallery.data';

@Component({
  selector: 'app-community-gallery',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './community-gallery.html',
  styleUrl: './community-gallery.css',
})
export class CommunityGalleryComponent implements OnInit {
  memories: CommunityMemory[] = []; 
  selectedMemory: CommunityMemory | null = null;

  constructor(private marTechService: MarTechService) {}

  ngOnInit(): void {
    const localMemories = JSON.parse(localStorage.getItem('community_user_memories') || '[]') as CommunityMemory[];
    this.memories = [
      ...COMMUNITY_MEMORIES.filter((memory) => memory.ugcConsent),
      ...localMemories.filter((memory) => memory.ugcConsent),
    ];
    this.marTechService.trackEvent('community_gallery_view', {
      gallery_type: 'demo_local',
      visible_demo_cards: this.memories.length,
      local_user_cards: localMemories.filter((memory) => memory.ugcConsent).length,
    });
  }

  openMemory(memory: CommunityMemory): void {
    this.selectedMemory = memory;
    this.marTechService.trackEvent('community_story_view', {
      memory_id: memory.id,
      theme_id: memory.themeId,
      data_type: memory.isDemo ? 'demo' : 'user_local',
    });
  }

  closeMemory(): void {
    this.selectedMemory = null;
  }
}
