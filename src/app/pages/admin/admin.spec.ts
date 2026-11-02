import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Admin } from './admin';
import { MarTechService } from '../../services/martech-service';
import { ConsentPrompt } from '../../components/consent-prompt/consent-prompt';

describe('Admin connected to customer events',()=>{
 beforeEach(()=>{
  localStorage.clear();sessionStorage.clear();
  TestBed.configureTestingModule({imports:[Admin,ConsentPrompt],providers:[provideRouter([])]});
 });
 it('updates the rendered dashboard when the customer records an action',()=>{
  const fixture=TestBed.createComponent(Admin);
  const tracking=TestBed.inject(MarTechService);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Đang chờ câu chuyện đầu tiên');
  tracking.enterCustomerPage('/page1');
  tracking.trackEvent('story_submit_success');
  tracking.trackEvent('memory_card_create_success');
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).not.toContain('Đang chờ câu chuyện đầu tiên');
  expect(fixture.componentInstance.stats().cards).toBe(1);
  expect(fixture.nativeElement.querySelector('.event-table').textContent).toContain('memory_card_create_success');
 });
 it('retains lead history across channels when filtering a later visit',()=>{
  const fixture=TestBed.createComponent(Admin);
  const tracking=TestBed.inject(MarTechService);
  sessionStorage.setItem('utm_source','facebook');
  tracking.trackEvent('contact_info_submitted');tracking.trackEvent('marketing_consent_granted');
  sessionStorage.setItem('utm_source','direct');
  tracking.trackEvent('product_collection_view');
  fixture.componentInstance.source.set('direct');
  expect(fixture.componentInstance.stats().lead).toBe(1);
  expect(fixture.componentInstance.stats().mql).toBe(1);
 });
 it('reloads persisted events after a storage notification from another tab',()=>{
  const tracking=TestBed.inject(MarTechService);
  const first=tracking.trackEvent('landing_page_view');
  const next={...first,event_id:'cross-tab',event_name:'memory_card_preview'};
  localStorage.setItem('ttwr.event.cross-tab',JSON.stringify(next));
  window.dispatchEvent(new StorageEvent('storage',{key:'ttwr.event.cross-tab'}));
  expect(tracking.events().some(e=>e.event_id==='cross-tab')).toBe(true);
 });
 it('records only a visible consent prompt and links its confirmation without saving the address',()=>{
  let intersect: IntersectionObserverCallback;
  vi.stubGlobal('IntersectionObserver',class {
   constructor(callback:IntersectionObserverCallback){intersect=callback;}
   observe(){} disconnect(){}
  });
  const fixture=TestBed.createComponent(ConsentPrompt);
  fixture.componentRef.setInput('source','share');
  fixture.detectChanges();
  const tracking=TestBed.inject(MarTechService);
  expect(tracking.events()).toHaveLength(0);
  intersect!([{isIntersecting:true,intersectionRatio:.2} as IntersectionObserverEntry],{} as IntersectionObserver);
  expect(tracking.events()).toHaveLength(0);
  intersect!([{isIntersecting:true,intersectionRatio:.8} as IntersectionObserverEntry],{} as IntersectionObserver);
  const component=fixture.componentInstance;
  component.contact='demo@example.com';component.agreed=true;
  component.confirm();fixture.detectChanges();
  const shown=tracking.events().find(e=>e.event_name==='marketing_consent_shown')!;
  const grant=tracking.events().find(e=>e.event_name==='marketing_consent_granted')!;
  expect(grant['consent_source']).toBe('share');
  expect(grant['consent_impression_id']).toBe(shown['consent_impression_id']);
  expect(JSON.stringify(tracking.events())).not.toContain('demo@example.com');
  expect(fixture.nativeElement.querySelector('section')).toBeNull();
  vi.unstubAllGlobals();
 });
});
