import { TestBed } from '@angular/core/testing';
import { beforeEach, expect, it } from 'vitest';
import { CommunityGalleryComponent } from './community-gallery';
import { CampaignAdminStore } from '../../services/campaign-admin-store';
import { AdminDataSource } from '../../services/admin-data-source';
import { MemoryThemeId } from '../../models/martech-events.model';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();TestBed.configureTestingModule({});});
it('uses the Admin source and immediately reflects approval, hiding and featuring without sample cards',()=>{
 const store=TestBed.inject(CampaignAdminStore),source=TestBed.inject(AdminDataSource);
 const gallery=TestBed.runInInjectionContext(()=>new CommunityGalleryComponent());
 const story=store.captureStory({nickname:'Test',periodYear:'1998',eraCategory:'90s',storyText:'Test story',photoUrl:null,theme_id:MemoryThemeId.GACH_LEGO},true)!;
 expect(gallery.memories()).toHaveLength(0);
 store.moderate(story.id,'approved');expect(gallery.memories().map(s=>s.id)).toEqual([story.id]);
 store.feature(story.id);expect(gallery.memories()[0].featured).toBe(true);
 source.mode.set('mock');expect(gallery.memories()).toHaveLength(0);
 source.mode.set('live');expect(gallery.memories()).toHaveLength(1);
 store.moderate(story.id,'hidden');expect(gallery.memories()).toHaveLength(0);
});
