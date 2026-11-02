import {describe,it,expect} from 'vitest';
import {classify} from './livestream';
describe('Livestream comment classification',()=>{
 it('supports accented text and multiple needs',()=>expect(classify('Bé 3 tuổi chơi được không, nhựa có an toàn không?')).toEqual(['age','safety']));
 it('does not manufacture needs for reactions or order-only comments',()=>{expect(classify('Đẹp quá ❤️')).toEqual([]);expect(classify('Chốt đơn một bộ')).toEqual([]);});
 it('recognizes instructions and offers',()=>expect(classify('Hướng dẫn cách chơi và voucher')).toEqual(['play','price']));
});
