import { describe, it, expect } from 'vitest';
import { analyze } from './dashboard-analytics';
import { TrackedEvent } from './martech-service';
let sequence = 0;
function event(name: string, visitor: string, data: Record<string, unknown> = {}): TrackedEvent {
 return {event_id:String(sequence++),event_name:name,visitor_id:visitor,session_id:'S'+visitor,device:'desktop',utm_source:'facebook',timestamp:new Date(1800000000000+sequence*1000).toISOString(),...data};
}
describe('Dashboard business rules',()=>{
 it('counts 19 SQL buyers over 35 SQL, excluding the 15 outside buyers',()=>{
  const events:TrackedEvent[]=[];
  for(let i=0;i<35;i++){
   const id='U'+i;
   events.push(event('contact_info_submitted',id),event('marketing_consent_granted',id),event('product_collection_view',id),event('add_to_cart',id));
   if(i<19) events.push(event('purchase',id));
  }
  for(let i=0;i<15;i++) events.push(event('purchase','OUT'+i));
  const s=analyze(events);
  expect(s.sql).toBe(35);expect(s.qualifiedCustomers).toBe(19);expect(s.customers).toBe(34);expect(s.outsideCustomers).toBe(15);
  expect(s.sqlRate).toBeCloseTo(54.2857);
 });
 it('includes abandoned consent impressions and deduplicates confirmations',()=>{
  const shown=[event('marketing_consent_shown','A',{consent_source:'create',consent_impression_id:'1'}),event('marketing_consent_shown','B',{consent_source:'create',consent_impression_id:'2'})];
  const grant=event('marketing_consent_granted','A',{consent_source:'create',consent_impression_id:'1'});
  const s=analyze([...shown,grant,grant,event('marketing_consent_granted','C',{consent_source:'share',consent_impression_id:'missing'})]);
  expect(s.consentRows[0]).toEqual({source:'create',shown:2,granted:1,rate:50});
  expect(s.consentRows[1].rate).toBeNull();
 });
 it('does not treat an outbound product click as a purchase or SQL',()=>{
  const s=analyze([event('product_outbound_click','A')]);
  expect(s.customers).toBe(0);expect(s.sql).toBe(0);expect(s.orders).toBe(0);
 });
 it('keeps SQL eligibility from before the selected period',()=>{
  const before=[event('contact_info_submitted','A'),event('marketing_consent_granted','A'),event('product_collection_view','A'),event('consult_request','A')];
  const purchase=event('purchase','A');
  expect(analyze([purchase],[...before,purchase]).sqlRate).toBe(100);
 });
 it('requires attribution and deduplicates transaction IDs for revenue',()=>{
  const a=event('purchase','A',{order_id:'O1',order_value:450000,campaign_attributed:true});
  const s=analyze([a,event('purchase','A',{order_id:'O1',order_value:450000,campaign_attributed:true}),event('purchase','B',{order_id:'O2',order_value:999999})]);
  expect(s.orders).toBe(1);expect(s.revenue).toBe(450000);
 });
 it('does not qualify someone who purchases before ever becoming SQL',()=>{
  const s=analyze([event('purchase','A'),event('contact_info_submitted','A'),event('marketing_consent_granted','A'),event('product_collection_view','A'),event('add_to_cart','A')]);
  expect(s.qualifiedCustomers).toBe(0);expect(s.sqlRate).toBe(0);
 });
});
