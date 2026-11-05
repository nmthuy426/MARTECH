import { Component, EventEmitter, Output, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarTechService } from '../../services/martech-service';
import { GiftShop, Recipient, newRecipient } from '../../services/gift-shop';
import { RecipientForm } from '../recipient-form/recipient-form';
@Component({selector:'app-gift-invitation',imports:[FormsModule,RecipientForm],template:`
<dialog #invite class="gift-modal" aria-labelledby="gift-invite-title" (cancel)="$event.preventDefault();closed.emit()">
  <button class="gift-close" type="button" aria-label="Đóng gợi ý quà" (click)="closed.emit()">×</button>
  <div class="gift-modal-body"><span class="gift-sticker">MỘT KÝ ỨC MỚI BẮT ĐẦU</span>
  <h2 id="gift-invite-title">Mang niềm vui này đến cho ai?</h2>
  <p>Bạn có muốn tìm một món đồ chơi để tạo thêm ký ức mới không?</p>
  <div class="gift-kind-options">
   <button type="button" [class.active]="recipient.kind==='self'" (click)="choose('self')">✦ Cho bản thân</button>
   <button type="button" [class.active]="recipient.kind==='child'" (click)="choose('child')">♡ Chơi cùng con</button>
   <button type="button" [class.active]="recipient.kind==='other'" (click)="choose('other')">🎁 Tặng người khác</button>
  </div>
  @if(shop.account() && shop.profiles().length){<label>Chọn hồ sơ đã đồng ý lưu<select (change)="useProfile($any($event.target).value)"><option value="">Điền thông tin mới</option>@for(p of shop.profiles();track p.id){<option [value]="p.id">{{p.nickname||'Người nhận chưa đặt tên'}}</option>}</select></label>}
  <app-recipient-form [recipient]="recipient" [showKind]="false"/>
  @if(shop.error()){<p role="alert">{{shop.error()}}</p>}
  </div><div class="gift-actions"><button type="button" class="gift-primary" (click)="continue()">Xem gợi ý quà →</button><button type="button" (click)="closed.emit()">Để sau, xem thẻ của tôi</button></div>
</dialog>
`})
export class GiftInvitation implements AfterViewInit {
 @ViewChild('invite') dialog!:ElementRef<HTMLDialogElement>;
 ngAfterViewInit(){this.tracking.trackEvent('gift_prompt_shown',{story_id:sessionStorage.getItem('ttwr.current_story')||''});if(typeof this.dialog.nativeElement.showModal==='function')this.dialog.nativeElement.showModal();else this.dialog.nativeElement.setAttribute('open','');}
 private tracking=inject(MarTechService);
 readonly shop=inject(GiftShop);private router=inject(Router);@Output() closed=new EventEmitter<void>();
 recipient:Recipient=structuredClone(this.shop.recipient());
 choose(kind:Recipient['kind']){this.recipient={...newRecipient(),kind};}
 useProfile(id:string){this.recipient=structuredClone(this.shop.profiles().find(p=>p.id===id)||newRecipient());}
 continue(){if(this.shop.setRecipient(this.recipient)){this.tracking.trackEvent('gift_recipient_selected',{recipient_kind:this.recipient.kind,using_saved_profile:!!this.recipient.id});this.closed.emit();void this.router.navigate(['/gift-shop']);}}
}
