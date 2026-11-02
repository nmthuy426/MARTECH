import { TrackedEvent } from './martech-service';
export const ratio = (n: number, d: number): number | null => d ? n / d * 100 : null;
export function analyze(events: TrackedEvent[], history = events) {
  const unique = (names: string[], key = 'session_id') => new Set(events.filter(e => names.includes(e.event_name)).map(e => String(e[key]))).size;
  const count = (name: string) => events.filter(e => e.event_name === name).length;
  const people = new Map<string, { lead?: number; mql?: number; sql?: number; bought?: number }>();
  // Reconstruct eligibility from the full preceding history, even when the visible period starts later.
  const contacts = new Set<string>();
  const consent = new Set<string>();
  const selectedIds = new Set(events.map(e => e.event_id));
  const qualifiedBuyers = new Set<string>();
  const outsideBuyers = new Set<string>();
  const outsideLeadBuyers = new Set<string>();
  const orders = new Map<string, TrackedEvent>();
  for (const e of [...history].sort((a,b) => a.timestamp.localeCompare(b.timestamp))) {
    const id = e.visitor_id || e.user_id;
    if (!id) continue;
    const p = people.get(id) || {};
    people.set(id,p);
    const t = Date.parse(e.timestamp);
    if (e.event_name === 'contact_info_submitted') contacts.add(id);
    if (e.event_name === 'marketing_consent_granted') consent.add(id);
    if (e.event_name === 'marketing_consent_withdrawn') consent.delete(id);
    if (contacts.has(id) && consent.has(id) && p.lead === undefined) p.lead = t;
    if (p.lead !== undefined && ['followup_click','product_collection_view'].includes(e.event_name)) p.mql ??= t;
    if (p.mql !== undefined && ['add_to_cart','consult_request'].includes(e.event_name)) p.sql ??= t;
    if (['purchase','voucher_redeem'].includes(e.event_name) && selectedIds.has(e.event_id)) {
      if (p.sql !== undefined && p.sql <= t) qualifiedBuyers.add(id); else outsideBuyers.add(id);
      if (p.lead === undefined) outsideLeadBuyers.add(id);
      p.bought = t;
      // Revenue requires explicit campaign attribution and a stable transaction identifier.
      const orderId = e['order_id'];
      if (orderId && e['campaign_attributed'] === true && Number(e['order_value']) >= 0) orders.set(String(orderId),e);
    }
  }
  const visiblePeople = new Set(events.map(e => e.visitor_id));
  const cohort = [...people.entries()].filter(([id]) => visiblePeople.has(id)).map(([,p])=>p);
  const lead = cohort.filter(p => p.lead !== undefined).length;
  const mql = cohort.filter(p => p.mql !== undefined).length;
  const sql = cohort.filter(p => p.sql !== undefined).length;
  const consentRows = ['create','share','connect'].map(source => {
    const shown = events.filter(e => e.event_name === 'marketing_consent_shown' && e['consent_source'] === source);
    const ids = new Set(shown.map(e => e['consent_impression_id']).filter(Boolean));
    // A response counts once and only when linked to an actual impression in this cohort.
    const granted = new Set(history.filter(e => e.event_name === 'marketing_consent_granted' && e['consent_source'] === source && ids.has(e['consent_impression_id'])).map(e => e['consent_impression_id'])).size;
    return { source, shown: ids.size, granted, rate: ratio(granted,ids.size) };
  });
  const revenue = [...orders.values()].reduce((sum,e)=>sum+Number(e['order_value']),0);
  const groupBy = (key: string, eventName: string) => {
    const map = new Map<string, Set<string>>();
    for (const e of events.filter(e=>e.event_name===eventName)) {
      const value=String(e[key] || 'Chưa xác định');
      if (!map.has(value)) map.set(value,new Set());
      map.get(value)!.add(e.visitor_id);
    }
    return [...map].map(([label,ids])=>({label,value:ids.size})).sort((a,b)=>b.value-a.value);
  };
  return {
    visitors: new Set(events.map(e=>e.visitor_id)).size,
    sessions: unique(['session_start']), stories: unique(['story_submit_success']),
    cards: unique(['memory_card_create_success']), errors: count('memory_card_create_fail'),
    previews: unique(['memory_card_preview']), shares: unique(['share_click']),
    collection: unique(['product_collection_view']), outbound: count('product_outbound_click'),
    lead,mql,sql, customers: new Set([...qualifiedBuyers,...outsideBuyers]).size,
    qualifiedCustomers: qualifiedBuyers.size, outsideCustomers: outsideLeadBuyers.size,
    sqlRate: ratio(qualifiedBuyers.size,sql), consentRows, revenue, orders: orders.size,
    channels: groupBy('utm_source','landing_page_view'), themes: groupBy('theme_id','memory_theme_select'),
    delivered: count('followup_delivered'), followupCtr: ratio(count('followup_click'),count('followup_delivered')),
    cardRate: ratio(unique(['memory_card_create_success']),unique(['story_submit_success'])),
  };
}
