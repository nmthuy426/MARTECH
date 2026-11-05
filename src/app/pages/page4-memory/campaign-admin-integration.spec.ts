import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {Page4Memory} from './page4-memory';
import {CommunityGalleryComponent} from '../community-gallery/community-gallery';
import {CampaignAdminStore} from '../../services/campaign-admin-store';
import {MarTechService} from '../../services/martech-service';
import {AdminDataSource} from '../../services/admin-data-source';
import {analyze} from '../../services/dashboard-analytics';
import {MemoryThemeId} from '../../models/martech-events.model';
const card={nickname:'Khách tích hợp',periodYear:'1998',eraCategory:'90s',storyText:'Tôi cùng bạn xây thành phố bằng những viên gạch màu.',photoUrl:null,theme_id:MemoryThemeId.GACH_LEGO};
describe('Microsite and Admin share one live data source',()=>{
 let store:CampaignAdminStore;let tracking:MarTechService;
 beforeEach(()=>{
  localStorage.clear();sessionStorage.clear();
  vi.stubGlobal('IntersectionObserver',class {constructor(private cb:IntersectionObserverCallback){}observe(){this.cb([{isIntersecting:true,intersectionRatio:1}] as IntersectionObserverEntry[],this as unknown as IntersectionObserver);}disconnect(){}});
  TestBed.configureTestingModule({imports:[Page4Memory,CommunityGalleryComponent],providers:[provideRouter([])]});
  tracking=TestBed.inject(MarTechService);store=TestBed.inject(CampaignAdminStore);
  const story=store.captureStory(card,false)!;sessionStorage.setItem('ttwr.current_story',story.id);sessionStorage.setItem('memory_card_data',JSON.stringify(card));
  tracking.trackEvent('story_submit_success',{story_id:story.id,card_id:story.cardId});
 });
 afterEach(()=>vi.unstubAllGlobals());
 it('captures contact without marketing opt-in and publishes only after Admin approval',()=>{
  const fixture=TestBed.createComponent(Page4Memory);fixture.detectChanges();const page=fixture.componentInstance;
  page.contactValue='demo@example.com';page.ugcConsent=true;page.marketingConsent=false;page.saveConnectPreferences();
  expect(page.contactSaved).toBe(true);expect(analyze(tracking.events()).lead).toBe(0);
  expect(tracking.events().filter(e=>e.event_name==='ugc_submission')).toHaveLength(1);
  const gallery=TestBed.createComponent(CommunityGalleryComponent).componentInstance;
  expect(gallery.memories().some(m=>m.nickname===card.nickname)).toBe(false);
  const story=store.campaignStories()[0];expect(store.moderate(story.id,'approved')).toBe(true);
  expect(gallery.memories().some(m=>m.id===story.id)).toBe(true);
  TestBed.inject(AdminDataSource).mode.set('mock');expect(gallery.memories().some(m=>m.id===story.id)).toBe(true);
  expect(store.updateCampaignUgc(story.id,false)).toBe(true);expect(gallery.memories().some(m=>m.id===story.id)).toBe(false);
 });
 it('pairs a real impression with opt-in, keeps raw contact out of tracking, and ignores repeated saves',()=>{
  const fixture=TestBed.createComponent(Page4Memory);fixture.detectChanges();const page=fixture.componentInstance;
  page.contactValue='demo@example.com';page.marketingConsent=true;page.saveConnectPreferences();page.saveConnectPreferences();
  const rows=analyze(tracking.events());expect(rows.lead).toBe(1);expect(rows.consentRows[0].shown).toBe(1);expect(rows.consentRows[0].granted).toBe(1);
  expect(tracking.events().filter(e=>e.event_name==='contact_info_submitted')).toHaveLength(1);
  expect(JSON.stringify(tracking.events())).not.toContain('demo@example.com');
  expect(localStorage.getItem('martech_connect_demo_records')).toBeNull();
 });
 it('allows withdrawal of both permissions without requiring new contact details',()=>{
  tracking.grantConsent('create','OLD','email');
  const fixture=TestBed.createComponent(Page4Memory);fixture.detectChanges();const page=fixture.componentInstance;
  page.marketingConsent=false;page.ugcConsent=false;page.saveConnectPreferences();
  expect(page.contactSaved).toBe(true);expect(tracking.consentGranted()).toBe(false);
  expect(store.campaignStories()[0].ugcConsent).toBe(false);
 });
 it('keeps marketing withdrawal and UGC permission independent',()=>{
  tracking.grantConsent('create','OLD','email');
  const fixture=TestBed.createComponent(Page4Memory);fixture.detectChanges();const page=fixture.componentInstance;
  page.marketingConsent=false;page.ugcConsent=true;page.saveConnectPreferences();
  expect(tracking.consentGranted()).toBe(false);expect(store.campaignStories()[0].ugcConsent).toBe(true);
  expect(tracking.events().some(e=>e.event_name==='marketing_consent_withdrawn')).toBe(true);
 });
});
