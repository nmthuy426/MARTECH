import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarTechService } from '../../services/martech-service';
import { CampaignAdminStore } from '../../services/campaign-admin-store';
import { COMMUNITY_MEMORIES, CommunityMemory } from './community-gallery.data';
@Component({selector:'app-community-gallery',standalone:true,imports:[RouterLink],templateUrl:'./community-gallery.html',styleUrl:'./community-gallery.css'})
export class CommunityGalleryComponent implements OnInit {
 private readonly store=inject(CampaignAdminStore);
 private readonly tracking=inject(MarTechService);
 readonly memories=computed<CommunityMemory[]>(()=>{
  const themes:Record<string,{name:string;emoji:string;tone:CommunityMemory['cardTone']}>= {
   gach_lego:{name:'Tháp Gạch Sắc Màu',emoji:'🧱',tone:'yellow'},bup_be:{name:'Búp Bê & Thú Bông',emoji:'🧸',tone:'pink'},board_game:{name:'Bàn Cờ & Boardgame',emoji:'🎲',tone:'mint'},canh_dieu:{name:'Cánh Diều & Gió Lộng',emoji:'🪁',tone:'blue'}
  };
  const stories=this.store.campaignStories().filter(s=>s.ugcConsent&&s.submitted&&s.status==='approved').sort((a,b)=>Number(b.featured)-Number(a.featured)||b.createdAt.localeCompare(a.createdAt));
  return [...stories.map(s=>({id:s.id,nickname:s.nickname,themeId:s.theme_id,themeLabel:themes[s.theme_id]?.name||s.theme_id,story:s.storyText,year:s.periodYear,toyEmoji:themes[s.theme_id]?.emoji||'✦',cardTone:themes[s.theme_id]?.tone||'yellow',ugcConsent:true,isDemo:false})),...COMMUNITY_MEMORIES.filter(m=>m.ugcConsent)];
 });
 selectedMemory:CommunityMemory|null=null;
 ngOnInit(){this.tracking.trackEvent('community_gallery_view',{visible_cards:this.memories().length});}
 openMemory(memory:CommunityMemory){this.selectedMemory=memory;this.tracking.trackEvent('community_story_view',{story_id:memory.id,theme_id:memory.themeId,data_type:memory.isDemo?'demo':'user_local'});}
 closeMemory(){this.selectedMemory=null;}
}
