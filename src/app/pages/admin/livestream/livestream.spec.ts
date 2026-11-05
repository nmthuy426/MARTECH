import {describe,it,expect} from 'vitest';
import {classify} from './livestream';
describe('Livestream comment classification',()=>{
 it('supports accented text and multiple needs',()=>expect(classify('Bé 3 tuổi chơi được không, nhựa có an toàn không?')).toEqual(['age','safety']));
 it('does not manufacture needs for reactions or order-only comments',()=>{expect(classify('Đẹp quá ❤️')).toEqual([]);expect(classify('Chốt đơn một bộ')).toEqual([]);});
 it('does not treat family mentions as price questions',()=>expect(classify('Cả gia đình cùng chơi')).not.toContain('price'));
 it('recognizes instructions and offers',()=>expect(classify('Hướng dẫn cách chơi và voucher')).toEqual(['play','price']));
});

import {TestBed} from '@angular/core/testing';
import {Livestream} from './livestream';
it('generates source-backed post and video drafts and isolates real-input mode from sample comments',()=>{
 localStorage.clear();TestBed.configureTestingModule({imports:[Livestream]});const fixture=TestBed.createComponent(Livestream);fixture.componentRef.setInput('mode','mock');fixture.detectChanges();const page=fixture.componentInstance;
 page.analyze();page.format='post';page.propose('safety');expect(page.draft()?.format).toBe('post');expect(page.draft()?.evidence.length).toBeGreaterThan(0);expect(page.draft()?.outline).toContain('bình luận');page.save();expect(page.saved()).toHaveLength(1);
 page.format='video';page.duration=30;page.propose('age');expect(page.draft()?.outline).toContain('22–30');
 fixture.componentRef.setInput('mode','live');fixture.detectChanges();expect(page.comments()).toHaveLength(0);expect(page.result()).toBeNull();page.inputSource='tiktok';page.bulk='Bé 4 tuổi chơi được không?\nCó hướng dẫn cách chơi không?';page.importComments();expect(page.comments()).toHaveLength(2);page.analyze();expect(page.topics().find(g=>g.id==='age')?.comments).toHaveLength(1);page.text='Món này giá bao nhiêu?';page.add();expect(page.stale()).toBe(true);page.draft.set(null);page.propose('price');expect(page.draft()).toBeNull();
});
