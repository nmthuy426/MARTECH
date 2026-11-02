import {Component,computed,input,signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
export interface Comment {id:string;name:string;text:string;time:string}
const groups=[
 {id:'age',name:'Độ tuổi phù hợp',keys:['tuoi','may thang','be 3','be 4','be 5'],title:'Chọn đồ chơi phù hợp độ tuổi của con',hook:'Bé mấy tuổi thì chơi được món này?',outline:'Giới thiệu độ tuổi khuyến nghị trên nhãn sản phẩm. Minh họa mức độ khó và cách phụ huynh đồng hành.'},
 {id:'safety',name:'An toàn & chất liệu',keys:['an toan','nhua','chat lieu','doc hai','nuot','canh sac'],title:'Cận cảnh chất liệu và thông tin an toàn của đồ chơi',hook:'Trước khi chọn đồ chơi, phụ huynh cần kiểm tra những gì?',outline:'Quay cận cảnh nhãn, chất liệu và cảnh báo chi tiết nhỏ. Xác minh thông tin bằng tài liệu sản phẩm trước khi viết lời khẳng định.'},
 {id:'play',name:'Cách chơi & hướng dẫn',keys:['cach choi','choi sao','huong dan','lap rap','choi nhu','luat choi'],title:'Hướng dẫn cùng con chơi trong 60 giây',hook:'Mở hộp xong thì bắt đầu chơi thế nào?',outline:'Giới thiệu các bộ phận. Làm mẫu từng bước và một tình huống chơi cùng con. Kết thúc bằng mẹo cất giữ.'},
 {id:'price',name:'Giá & ưu đãi',keys:['gia','bao nhieu','giam','ma uu dai','voucher','sale'],title:'Giải thích giá và cách dùng ưu đãi livestream',hook:'Làm sao nhận và sử dụng mã ưu đãi?',outline:'Dùng mức giá và điều kiện ưu đãi đã được xác nhận. Làm mẫu cách nhận mã qua liên kết và cách áp dụng khi mua.'},
 {id:'benefit',name:'Giá trị phát triển',keys:['phat trien','tu duy','sang tao','ky nang','tap trung'],title:'Một buổi chơi cùng con có thể học được gì?',hook:'Ngoài niềm vui, con có thể luyện kỹ năng nào khi chơi?',outline:'Minh họa hoạt động quan sát, phối hợp và giải quyết vấn đề. Tránh cam kết kết quả phát triển chưa có bằng chứng.'}
];
export function classify(text:string){const t=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();return groups.filter(g=>g.keys.some(k=>t.includes(k))).map(g=>g.id);}
export function feedback(text:string){const t=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');return /lo ngai|lo lang|so |khong an toan|doc hai|de nuot|canh sac|chat luong kem/.test(t)?'concern':/dep|thich|hay qua|tot|ben|ung y/.test(t)?'praise':'other';}
const examples=['Bé 3 tuổi chơi bộ này được chưa?','Nhựa này có an toàn không shop?','Hướng dẫn cách chơi với ạ','Bao nhiêu tiền, có voucher không?','Có giúp con phát triển tư duy không?','Bé 4 tuổi dùng được không, có chi tiết nhỏ dễ nuốt không?','Đẹp quá ❤️','Chốt đơn một bộ nhé','Cách lắp ráp có khó không?','Có mã ưu đãi livestream không?'];
const samples:Comment[]=Array.from({length:150},(_,i)=>({id:'LC'+i,name:['Mẹ Bắp','Ba Sóc','Mẹ An','Ba Minh','Mẹ Gấu'][i%5]+' '+(i+1),text:examples[i%examples.length],time:`20:${String(Math.floor(i/3)).padStart(2,'0')}`}));
@Component({selector:'app-livestream',imports:[FormsModule],templateUrl:'./livestream.html',styleUrl:'./livestream.css'})
export class Livestream {
 readonly mode=input('mock');readonly session=signal('family');readonly extra=signal<Record<string,Comment[]>>({});readonly result=signal<Comment[]|null>(null);readonly draft=signal<{group:string;title:string;hook:string;outline:string;cta:string;evidence:string[]}|null>(null);readonly message=signal('');readonly page=signal(0);readonly search=signal('');
 name='';text='';
 readonly comments=computed(()=>[...(this.mode()==='mock'?samples.slice(this.session()==='family'?0:90,this.session()==='family'?90:150):[]),...(this.extra()[this.key()]||[])]);
 readonly rows=computed(()=>this.comments().filter(c=>(c.name+' '+c.text).toLowerCase().includes(this.search().toLowerCase())));
 readonly topics=computed(()=>groups.map(g=>({...g,comments:(this.result()||[]).filter(c=>classify(c.text).includes(g.id))})).sort((a,b)=>b.comments.length-a.comments.length));
 readonly feedbackRows=computed(()=>[{id:'praise',name:'Khen / yêu thích'},{id:'concern',name:'Lo ngại / cần làm rõ'},{id:'other',name:'Trung tính / chưa phân loại'}].map(g=>({...g,comments:(this.result()||[]).filter(c=>feedback(c.text)===g.id)})));
 readonly classified=computed(()=>(this.result()||[]).filter(c=>classify(c.text).length).length);
 readonly stale=computed(()=>this.result()!==null&&this.comments().length!==this.result()!.length);
 readonly saved=signal<any[]>(this.read());
 key(){return this.mode()+':'+this.session();}
 read(){try{return JSON.parse(localStorage.getItem('ttwr.livestream.drafts')||'[]');}catch{return [];}}
 reset(){this.result.set(null);this.draft.set(null);this.page.set(0);this.message.set('');this.search.set('');}
 add(){if(!this.text.trim())return;const c={id:crypto.randomUUID(),name:this.name.trim()||'Phụ huynh',text:this.text.trim(),time:new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})};this.extra.update(v=>({...v,[this.key()]:[...(v[this.key()]||[]),c]}));this.text='';this.page.set(Math.floor((this.comments().length-1)/10));this.message.set('Đã thêm bình luận. Bấm phân tích để cập nhật kết quả.');}
 analyze(){this.result.set([...this.comments()]);this.draft.set(null);this.message.set('Đã phân tích toàn bộ bình luận của phiên đang chọn.');}
 propose(id:string){const g=this.topics().find(g=>g.id===id)!;this.draft.set({group:g.name,title:g.title,hook:g.hook,outline:g.outline,cta:'Để lại câu hỏi hoặc bấm liên kết để tìm hiểu sản phẩm phù hợp cho gia đình.',evidence:g.comments.slice(0,3).map(c=>c.name+': '+c.text)});}
 save(){if(!this.draft())return;const item={...structuredClone(this.draft()),mode:this.mode(),session:this.session(),id:crypto.randomUUID()};try{const next=[item,...this.read()];localStorage.setItem('ttwr.livestream.drafts',JSON.stringify(next));this.saved.set(next);this.message.set('Đã lưu ý tưởng tại trình duyệt.');this.draft.set(null);}catch{this.message.set('Không lưu được: bộ nhớ trình duyệt không khả dụng.');}}
}
