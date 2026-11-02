import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MarTechService } from '../../services/martech-service';
import { analyze, ratio } from '../../services/dashboard-analytics';
@Component({
 selector:'app-admin', imports:[CommonModule,FormsModule,RouterLink],
 templateUrl:'./admin.html', styleUrl:'./admin.css'
})
export class Admin {
 readonly tracking = inject(MarTechService);
 readonly source = signal('all'); readonly device = signal('all');
 readonly from = signal(''); readonly to = signal(''); readonly search = signal('');
 readonly page = signal(0);
 readonly sources = computed(()=> [...new Set(this.tracking.events().map(e=>e.utm_source))].sort());
 readonly history = computed(()=>this.tracking.events().filter(e=>
   (!this.to() || this.day(e.timestamp)<=this.to())));
 readonly filtered = computed(()=>this.history().filter(e=>
   (this.source()==='all'||e.utm_source===this.source()) &&
   (this.device()==='all'||e.device===this.device()) &&
   (!this.from() || this.day(e.timestamp)>=this.from())));
 readonly stats = computed(()=>analyze(this.filtered(),this.history()));
 readonly matching = computed(()=>[...this.filtered()].reverse().filter(e=>
   `${e.event_name} ${e.visitor_id} ${e.session_id} ${e.user_id||''}`.toLowerCase().includes(this.search().toLowerCase())));
 readonly rows = computed(()=>this.matching().slice(this.page()*15,this.page()*15+15));
 readonly lastUpdate = computed(()=>this.tracking.events().at(-1)?.timestamp);
 readonly funnel = computed(()=>{
   const s=this.stats();
   return [
    {name:'Khám phá microsite',value:this.landingSessions(),note:'Phiên xem landing page'},
    {name:'Bắt đầu kể chuyện',value:this.sessions('story_form_start'),note:'Phiên bắt đầu form'},
    {name:'Gửi câu chuyện',value:s.stories,note:'Phiên gửi thành công'},
    {name:'Tạo memory card',value:s.cards,note:'Phiên tạo card thành công'},
    {name:'Xem bộ sưu tập',value:s.collection,note:'Phiên mở trang sản phẩm'},
   ];
 });
 day(timestamp:string) { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(timestamp)); }
 sessions(name:string) { return new Set(this.filtered().filter(e=>e.event_name===name).map(e=>e.session_id)).size; }
 landingSessions() { return this.sessions('landing_page_view'); }
 percent(value:number|null) { return value===null?'—':`${value.toLocaleString('vi-VN',{maximumFractionDigits:1})}%`; }
 rate(n:number,d:number) { return this.percent(ratio(n,d)); }
 width(n:number,total:number) { return total?Math.max(0,Math.min(100,n/total*100)):0; }
 label(value:string) {
   return ({gach_lego:'Lắp ghép',bup_be:'Búp bê & thú bông',board_game:'Trò chơi bàn',canh_dieu:'Ngoài trời',lap_ghep:'Lắp ghép',tro_choi_ban:'Trò chơi bàn',ngoai_troi:'Ngoài trời',create:'Sau tạo card',share:'Khi chia sẻ',connect:'Trang cộng đồng'} as Record<string,string>)[value] || value;
 }
 scrollTo(id:string,event:Event) { event.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); }
 reset() { this.source.set('all');this.device.set('all');this.from.set('');this.to.set('');this.search.set('');this.page.set(0); }
 exportCsv() {
   const columns=['event_id','event_name','timestamp','session_id','visitor_id','user_id','utm_source','theme_id','device','consent_source','consent_impression_id','ab_group','order_id','order_value'];
   const cell=(v:unknown)=> { const s=String(v??'');return '"'+(/^[=+\-@]/.test(s)?"'"+s:s).replaceAll('"','""')+'"'; };
   const csv='\uFEFF'+[columns,...this.filtered().map(e=>columns.map(k=>e[k]))].map(row=>row.map(cell).join(',')).join('\r\n');
   const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
   const a=document.createElement('a');a.href=url;a.download='the-toys-we-remember-events.csv';a.click();URL.revokeObjectURL(url);
 }
}
