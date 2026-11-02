import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CampaignAdminStore } from './campaign-admin-store';
import { MarTechService } from './martech-service';
import { MemoryThemeId } from '../models/martech-events.model';
const card={nickname:'Khách thử nghiệm',periodYear:'1998',eraCategory:'90s',storyText:'Một buổi chiều lắp ghép cùng bạn.',photoUrl:null,theme_id:MemoryThemeId.GACH_LEGO};
describe('Campaign Admin store',()=>{
 let store:CampaignAdminStore;let tracking:MarTechService;
 beforeEach(()=>{localStorage.clear();sessionStorage.clear();TestBed.configureTestingModule({});store=TestBed.inject(CampaignAdminStore);tracking=TestBed.inject(MarTechService);});
 it('persists newly created stories and keeps private stories out of approval',()=>{
  const story=store.captureStory(card,false)!;
  expect(store.stories()).toHaveLength(1);
  expect(store.moderate(story.id,'approved')).toBe(false);
  expect(store.feature(story.id)).toBe(false);
  expect(store.stories()[0].status).toBe('pending');
  store.refresh();expect(store.stories()[0].storyText).toBe(card.storyText);
 });
 it('allows UGC approval and featuring, then removes featured status when hidden',()=>{
  const story=store.captureStory(card,true)!;
  expect(store.feature(story.id)).toBe(false);
  expect(store.moderate(story.id,'approved')).toBe(true);
  expect(store.feature(story.id)).toBe(true);
  expect(store.stories()[0].featured).toBe(true);
  store.moderate(story.id,'hidden');expect(store.stories()[0].featured).toBe(false);
 });
 it('blocks a workflow without consent and never inserts simulated deliveries into analytics',()=>{
  const start=tracking.trackEvent('landing_page_view');
  const run=store.simulate(start.visitor_id,'Lắp ghép');
  expect(run.status).toBe('blocked');
  expect(tracking.events().some(e=>e.event_name==='followup_delivered')).toBe(false);
 });
 it('enforces channel, daily limit and immediate suppression after consent withdrawal',()=>{
  tracking.grantConsent('create','IMPRESSION','zalo');
  const visitor=tracking.events()[0].visitor_id;
  expect(store.simulate(visitor,'Lắp ghép').channel).toBe('zalo');
  expect(store.runs()[0].status).toBe('simulated');
  expect(store.simulate(visitor,'Lắp ghép').reason).toContain('trong ngày');
  expect(tracking.withdrawConsent(visitor)).toBe(true);
  expect(tracking.consentGranted()).toBe(false);
  expect(store.simulate(visitor,'Lắp ghép').reason).toContain('hủy');
 });
 it('prefers an existing Zalo contact even if the latest contact submission is email',()=>{
  tracking.grantConsent('create','IMPRESSION','zalo');
  tracking.trackEvent('contact_info_submitted',{contact_type:'email'});
  expect(store.simulate(tracking.events()[0].visitor_id,'Lắp ghép').channel).toBe('zalo');
 });
 it('stops reminders after a real follow-up click',()=>{
  tracking.grantConsent('create','IMPRESSION','email');
  tracking.trackEvent('followup_click');
  expect(store.simulate(tracking.events()[0].visitor_id,'Búp bê').reason).toContain('dừng nhắc');
 });
 it('validates and persists vouchers without silently duplicating a code',()=>{
  const voucher={id:'1',code:'MEMORY15',discount:15,expires:'2026-12-27',limit:100,active:true};
  expect(store.saveVoucher(voucher)).toBe(true);
  expect(store.saveVoucher({...voucher,id:'2'})).toBe(false);
  expect(store.saveVoucher({...voucher,id:'3',code:'OTHER',discount:120})).toBe(false);
  store.refresh();expect(store.vouchers()).toHaveLength(1);
 });
 it('rejects an invalid campaign date range or a messaging cap above the agreed limit',()=>{
  const settings=structuredClone(store.settings());
  expect(store.saveSettings({...settings,start:'2026-12-27',end:'2026-11-02'})).toBe(false);
  expect(store.saveSettings({...settings,dailyLimit:2})).toBe(false);
  expect(store.saveSettings({...settings,name:'Campaign cập nhật'})).toBe(true);
  store.refresh();expect(store.settings().name).toBe('Campaign cập nhật');
 });
});
