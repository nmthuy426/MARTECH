#!/usr/bin/env python3
"""Reproducible, relational campaign fixture. No third-party packages required."""
import json, random
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/mock/mykingdom_campaign_mock_400.json'
TZ = timezone(timedelta(hours=7))
START = datetime(2026, 11, 2, tzinfo=TZ)
END = datetime(2026, 12, 27, 23, 59, 59, tzinfo=TZ)
AS_OF = datetime(2026, 12, 28, tzinfo=TZ)
THEMES = {'gach_lego': 'Lắp ghép', 'bup_be': 'Búp bê & thú bông', 'board_game': 'Trò chơi bàn', 'canh_dieu': 'Ngoài trời'}
SEED = 42

def iso(t): return t.isoformat(timespec='seconds')

def generate():
    r = random.Random(SEED)
    data = {key: [] for key in ['customers', 'sessions', 'events', 'stories', 'followups', 'sales_handoffs', 'orders', 'vouchers', 'products', 'content_metrics', 'campaign_costs']}
    data['metadata'] = {'schema_version': '1.0', 'dataset_id': 'ttwr-400-seed42-v1', 'seed': SEED, 'is_mock': True, 'customer_count': 400, 'generated_at': iso(AS_OF), 'reporting_as_of': iso(AS_OF), 'currency': 'VND', 'notes': ['All people, contacts, performance and prices are fictional.', 'First-touch allocations differ from per-session sources on return visits.', 'Social reach is not deduplicated across content or platforms.', 'LTV assumes three total purchases in twelve months, including the first.']}
    data['campaign'] = {'campaign_id': 'TTWR2026', 'name': 'The Toys We Remember', 'start': '2026-11-02', 'end': '2026-12-27', 'timezone': 'Asia/Ho_Chi_Minh', 'status': 'completed', 'daily_limit': 1, 'weekly_limit': 3, 'ab_enabled': True, 'ab_ratio': [50, 50], 'template_a': 'Cảm ơn bạn đã chia sẻ ký ức! Khám phá những món đồ chơi để cùng tạo ký ức mới.', 'template_b': 'Ký ức về {theme} vẫn còn ở đây. Khám phá bộ sưu tập theo chủ đề bạn yêu thích!', 'attribution': {'online': 'campaign voucher OR last campaign click within seven days', 'store': 'verified campaign voucher at POS', 'deduplicate_by': 'order_id'}, 'ltv_total_purchases_12m': 3, 'themes': []}
    bases = {'gach_lego': ('lego-classic-10698', 'Bộ gạch sáng tạo'), 'bup_be': ('barbie-retro-signature', 'Búp bê ký ức'), 'board_game': ('monopoly-vintage-wood', 'Trò chơi gia đình'), 'canh_dieu': ('kite-memory', 'Bộ vui chơi ngoài trời')}
    for theme, (base, name) in bases.items():
        ids = []
        for j, price in enumerate([350000, 450000, 550000, 650000]):
            pid = base if j == 0 else f'{base}-{j+1}'
            ids.append(pid)
            data['products'].append({'product_id': pid, 'name': f'{name} – mẫu {chr(65+j)}', 'theme_id': theme, 'price': price, 'photo_url': None, 'product_url': None, 'is_mock': True})
        data['campaign']['themes'].append({'id': theme, 'name': THEMES[theme], 'products': ids})
    for j, code in enumerate(['TTWR15', 'TTWRSTORE15', 'TTWRFAMILY15']):
        data['vouchers'].append({'voucher_id': f'VOUCHER{j+1:03}', 'code': code, 'discount_percent': 15, 'expires_at': iso(END), 'limit': 100, 'redemptions': 0, 'active': True, 'conditions': 'Applies to the campaign collection; one voucher per order.'})
    names = ['An', 'Bình', 'Chi', 'Dương', 'Giang', 'Hà', 'Hiền', 'Huy', 'Khánh', 'Lam', 'Linh', 'Minh', 'Nam', 'Ngân', 'Nhi', 'Phúc', 'Quân', 'Thảo', 'Trang', 'Vy']
    nick = ['Bắp', 'Tí Sún', 'Mây Nhỏ', 'Sóc Nâu', 'Bin Lắp Ghép', 'Na Búp Bê', 'Cún Ham Chơi', 'Mít Ướt', 'Cá Con', 'Gấu Trúc', 'Thỏ Bông', 'Bông Gòn', 'Heo Đất', 'Đậu Xanh', 'Nấm Lùn', 'Su Hào', 'Sâu Nhỏ', 'Còi', 'Bé Kem', 'Chíp Chíp']
    nicknames = [f'{a} {b}' for a in names for b in nick]; r.shuffle(nicknames)
    acquisition = []
    for source, mobile, desktop in [('facebook',144,36),('tiktok',96,24),('youtube',32,8),('zalo',32,8),('direct',16,4)]:
        acquisition += [(source, 'mobile')]*mobile + [(source, 'desktop')]*desktop
    r.shuffle(acquisition)
    visits = []
    for week, count in enumerate([32,40,48,60,72,60,48,40]):
        for _ in range(count):
            visits.append((week+1, r.randrange(7)))
    r.shuffle(visits)
    peak = [True]*260 + [False]*140; r.shuffle(peak)
    cs = []
    for i in range(400):
        week, day = visits[i]
        hour = r.randrange(19,23) if peak[i] else r.randrange(7,19)
        first = START + timedelta(days=(week-1)*7+day, hours=hour, minutes=r.randrange(26), seconds=r.randrange(50))
        source, device = acquisition[i]
        cs.append({'i':i, 'id':f'V{i+1:04}', 'first':first, 'week':week, 'source':source, 'device':device, 'nick':nicknames[i]})
    eligible = [c for c in cs if c['first'] < datetime(2026,12,22,tzinfo=TZ)]
    # Ensure the 130 form entrants have time for returns, follow-up and a 24h handoff.
    form = r.sample(eligible,130)
    rest = [c for c in cs if c not in form]
    engaged = form + r.sample(rest,130); r.shuffle(engaged)
    theme_values = ['gach_lego']*91+['bup_be']*65+['board_game']*52+['canh_dieu']*52; r.shuffle(theme_values)
    for c, theme in zip(engaged, theme_values): c['theme'] = theme
    stories = r.sample(form,98); r.shuffle(stories)
    immediate = stories[:89]; failed = stories[89:]; retry = failed[:6]; recovered = retry[:4]
    successful = immediate+recovered
    leads = r.sample(successful,46); r.shuffle(leads)
    A, B = leads[:23],leads[23:]
    for c in A:c['group']='A'
    for c in B:c['group']='B'
    sources=['create']*32+['share']*9+['connect']*5;r.shuffle(sources)
    for c, source in zip(leads,sources):c['consent_source']=source
    mqlA=r.sample(A,12);mqlB=r.sample(B,13)
    sqlA=r.sample(mqlA,6);sqlB=r.sample(mqlB,8)
    boughtA=r.sample(sqlA,3);boughtB=r.sample(sqlB,5)
    clickA=r.sample(mqlA,2);clickB=r.sample(mqlB,4)
    openedA=clickA+r.sample([c for c in A if c not in clickA],12)
    openedB=clickB+r.sample([c for c in B if c not in clickB],14)
    contact_only=r.sample([c for c in successful if c not in leads],19)
    outside=r.sample(contact_only,6)
    buyers=boughtA+boughtB+outside;r.shuffle(buyers)
    for j,c in enumerate(buyers):c['order_index']=j;c['purchase_channel']='store' if j<4 else 'online'
    contact_customers=leads+contact_only;r.shuffle(contact_customers)
    ctypes=['zalo']*40+['email']*15+['both']*10;r.shuffle(ctypes)
    for c,ctype in zip(contact_customers,ctypes):c['ctype']=ctype;c['uid']=f'U{c["i"]+1:04}'
    ugc=r.sample(successful,30);r.shuffle(ugc)
    for j,c in enumerate(ugc):c['ugc_status']='pending' if j<8 else 'approved' if j<26 else 'hidden';c['featured']=8<=j<14
    withdrew=r.sample([c for c in leads if c not in mqlA+mqlB],4)
    connect_leads=[c for c in leads if c['consent_source']=='connect']
    share_pool=[c for c in leads if c['consent_source']=='share']+connect_leads
    share_pool+=r.sample([c for c in successful if c not in leads],21)
    connect_pool=connect_leads+r.sample([c for c in successful if c not in leads],15)
    returns=connect_pool+r.sample([c for c in engaged if c in eligible and c not in connect_pool],80)
    all_sessions={}; sessions_for={}; session_n=0; event_n=0
    def event(c,name,t,session=None,**props):
        nonlocal event_n
        event_n+=1
        e={'event_id':f'E{event_n:06}', 'event_name':name, 'timestamp':iso(t), 'visitor_id':c['id'], 'user_id':None, 'session_id':session['session_id'] if session else None, 'utm_source':session['utm_source'] if session else c['source'], 'device':c['device'], 'theme_id':None, 'ab_group':None, **props}
        data['events'].append(e);return e
    def session(c,t,source,kind):
        nonlocal session_n
        session_n+=1
        s={'session_id':f'S{session_n:05}', 'visitor_id':c['id'], 'user_id':None, 'start_at':iso(t), 'end_at':iso(t+timedelta(seconds=29)), 'utm_source':source, 'utm_medium':'none' if source=='direct' else 'campaign', 'utm_campaign':'TTWR2026', 'device':c['device'], 'kind':kind}
        data['sessions'].append(s);all_sessions[s['session_id']]=s;sessions_for.setdefault(c['id'],[]).append(s)
        event(c,'session_start',t,s);event(c,'landing_page_view',t+timedelta(seconds=1),s)
        if kind!='first' and t-c['first']<=timedelta(days=7):event(c,'return_visit',t+timedelta(seconds=2),s,days_since_first_visit=round((t-c['first']).total_seconds()/86400,4))
        return s
    def content(source):return f'{source.upper()}_VIDEO_{r.randrange(1,3)}'
    for c in cs:
        s=session(c,c['first'],c['source'],'first');c['first_session']=s
        if c['source']!='direct':event(c,'campaign_link_click',c['first']-timedelta(seconds=2),utm_campaign='TTWR2026',platform=c['source'],content_id=content(c['source']))
        if 'theme' in c:
            c['theme_at']=c['first']+timedelta(seconds=r.randrange(8,20));event(c,'memory_theme_select',c['theme_at'],s)
    for c in returns:
        c['return_session']=session(c,c['first']+timedelta(days=1,hours=1),r.choice(['direct','zalo','facebook']),'return')
        event(c,'community_story_view',datetime.fromisoformat(c['return_session']['start_at'])+timedelta(seconds=10),c['return_session'])
    photo_set={c['id'] for c in r.sample(form,78)}
    openings=['Hồi còn học tiểu học, tôi thường mong đến chiều cuối tuần để được chơi cùng các bạn trong xóm.', 'Mỗi kỳ nghỉ hè, căn phòng nhỏ nhà bà lại trở thành nơi tụi tôi bày đủ món đồ chơi yêu thích.', 'Tôi vẫn nhớ buổi sinh nhật năm ấy, khi món quà nhỏ được đặt ngay cạnh chiếc bánh mẹ tự làm.', 'Sau giờ học, tôi hay ghé cửa hàng đầu ngõ, đứng nhìn những món đồ chơi qua lớp kính một lúc lâu.', 'Có một mùa hè trời mưa liên tục, cả nhà ngồi cạnh nhau và nghĩ ra đủ trò chơi trong phòng khách.', 'Ngày còn bé, tôi đã dành dụm tiền lẻ trong chiếc hộp thiếc suốt nhiều tuần cho một món đồ chơi.', 'Khi gia đình dọn nhà, tôi tìm lại chiếc hộp cũ và bất ngờ nhớ ra trò chơi từng gắn với mình.', 'Trong ký ức của tôi, những ngày vui nhất thường bắt đầu bằng tiếng bạn gọi nhau trước cổng nhà.']
    cores={
      'gach_lego':['Những viên gạch màu trở thành một thành phố có cầu, nhà và cả gara nhỏ do tôi tự nghĩ ra.', 'Tôi lắp chiếc xe rồi tháo ra làm tàu, chẳng cần giống hình mẫu mà vẫn thấy rất tự hào.', 'Tòa tháp cứ đổ khi xếp lên quá cao, nhưng tôi và bạn lại cười rồi tìm cách làm chân đế rộng hơn.', 'Anh chỉ tôi cách ghép mái nhà chắc hơn, còn tôi lo chọn màu cho khu vườn phía trước.', 'Một vài mảnh bị thiếu khiến tôi phải nghĩ cách thay đổi thiết kế của căn nhà trong tưởng tượng.', 'Tôi mang mô hình vừa lắp khoe cả nhà, dù nó chỉ là một chiếc máy bay có đôi cánh không đều.'],
      'bup_be':['Tôi lấy vải thừa may chiếc áo mới cho búp bê, đường chỉ vụng về nhưng đó vẫn là bộ đồ tôi thích nhất.', 'Chú gấu bông ngồi bên gối nghe tôi kể chuyện trường lớp, trở thành người bạn chẳng bao giờ ngắt lời.', 'Tụi tôi dùng hộp giấy làm nhà cho búp bê, rồi thay nhau nghĩ ra những câu chuyện gia đình rất vui.', 'Món đồ chơi được chị trao lại hơi sờn màu, nhưng tôi luôn giữ trong một chiếc túi sạch.', 'Tôi từng đặt tên cho từng người bạn búp bê và dành cả buổi chiều sắp xếp chỗ ngồi cho chúng.', 'Bà giúp tôi khâu lại chiếc tai thú bông, khiến món quà cũ bỗng trở nên đáng quý hơn trước.'],
      'board_game':['Bàn cờ trải giữa nhà khiến cả nhóm quên mất thời gian, ai cũng chờ đến lượt tung xúc xắc.', 'Tôi nhớ những cuộc đổi chác rất nghiêm túc trên bàn cờ tỷ phú, rồi cả đám lại phá lên cười.', 'Bố thường nhường tôi chọn quân đầu tiên, nhưng vẫn giải thích thật kỹ vì sao một nước đi lại hay.', 'Một ván cờ cá ngựa kéo dài cả buổi chiều, tiếng reo vui vang lên mỗi khi có người về đích.', 'Tôi tự kẻ một bàn chơi trên giấy, nhặt những chiếc nút áo làm quân để rủ các bạn cùng thử.', 'Dù thua ván cuối, tôi vẫn muốn chơi thêm vì thích cảm giác mọi người ngồi quây lại với nhau.'],
      'canh_dieu':['Chiếc diều giấy được dán từ những tờ báo cũ cuối cùng cũng lên cao sau nhiều lần chạy ngược gió.', 'Tôi và bạn ngồi vót những thanh tre nhỏ, vừa làm diều vừa tranh luận xem chiếc đuôi nên dài bao nhiêu.', 'Khoảng sân trước nhà biến thành đường đua, nơi những trò chơi đơn giản cũng khiến cả nhóm hào hứng.', 'Bố dạy tôi nhìn hướng gió trước khi thả diều, một bài học nhỏ mà đến giờ tôi vẫn nhớ.', 'Chúng tôi dùng phấn vẽ ô trên sân rồi thay nhau chơi, đôi dép cũ đặt ngay bên những viên sỏi.', 'Chỉ một quả bóng và khoảng sân rộng đã đủ để tụi tôi có một buổi chiều đầy tiếng cười.']}
    details=['Mỗi lần nghĩ lại, tôi nhớ tiếng cười nhiều hơn giá tiền của món quà.', 'Có lúc làm chưa được, tôi kiên nhẫn thử lại và nhận ra mình có thể tự tìm cách giải quyết.', 'Tôi đã giữ món đồ ấy rất lâu, ngay cả khi nó không còn mới như ngày đầu.', 'Những chuyện nhỏ ấy làm tôi hiểu niềm vui có thể đến từ việc cùng nhau làm một điều thật đơn giản.', 'Điều tôi nhớ nhất là cảm giác có người ngồi bên cạnh, lắng nghe và cùng chia sẻ sự hào hứng.', 'Bức ảnh trong album gia đình chỉ ghi lại một khoảnh khắc, còn những âm thanh hôm ấy vẫn rất rõ trong tôi.']
    endings=['Bây giờ tôi muốn dành thêm thời gian chơi cùng con, để cùng tạo những kỷ niệm riêng của gia đình.', 'Nếu tìm lại được một phiên bản gần giống, tôi sẽ rủ cả nhà cùng thử và kể lại câu chuyện ngày ấy.', 'Tôi không cần mọi thứ giống hệt tuổi thơ; chỉ mong niềm vui được chia sẻ vẫn còn nguyên vẹn.', 'Nhìn đồ chơi hôm nay, tôi lại muốn kể cho người thân nghe vì sao món quà nhỏ năm ấy đáng nhớ đến vậy.', 'Tôi mong những buổi chiều không vội vã như thế sẽ tiếp tục có chỗ trong cuộc sống hiện tại.', 'Với tôi, giá trị của món đồ nằm ở những người đã cùng chơi và những điều chúng tôi học được.']
    used_text=set()
    for c in form:
        s=c['first_session'];t=c['first']
        event(c,'story_form_start',t+timedelta(seconds=25),s);event(c,'photo_step_view',t+timedelta(seconds=45),s)
        event(c,'memory_photo_upload' if c['id'] in photo_set else 'photo_step_skip',t+timedelta(seconds=60),s,**({'file_size_kb':r.randrange(120,1400)} if c['id'] in photo_set else {}))
        if c not in stories:continue
        submitted=t+timedelta(minutes=r.randrange(3,7));c['story_at']=submitted
        while True:
            story_text=' '.join([r.choice(openings),r.choice(cores[c['theme']]),r.choice(details),r.choice(endings)])
            if story_text not in used_text and 40<=len(story_text.split())<=120:break
        used_text.add(story_text)
        sid=f'STORY{len(data["stories"])+1:03}';card_id=f'CARD{len(data["stories"])+1:03}' if c in successful else None
        c['story_id']=sid;c['card_at']=submitted+timedelta(seconds=5 if c in immediate else 50)
        story={'story_id':sid,'card_id':card_id,'visitor_id':c['id'],'session_id':s['session_id'],'nickname':c['nick'],'period_year':str(r.randrange(1990,2008)),'era_category':r.choice(['90s','2000s','2006s']),'story_text':story_text,'theme_id':c['theme'],'photo_url':None,'has_photo':c['id'] in photo_set,'created_at':iso(submitted),'card_status':'success' if c in successful else 'failed','ugc_usage_consent':c in ugc,'submitted_to_community':c in ugc,'community_status':c.get('ugc_status','pending'),'featured':c.get('featured',False),'ai_analysis':{'sentiment':r.choice(['tich_cuc','tich_cuc','trung_tinh']),'topics':[THEMES[c['theme']],'ký ức tuổi thơ']}}
        data['stories'].append(story)
        event(c,'story_submit_success',submitted,s,story_id=sid,story_length=len(story_text))
        if c in failed:
            error_type=['anh_qua_nang','loi_tao_card','mat_ket_noi'][failed.index(c)%3]
            story['error_type']=error_type;event(c,'memory_card_create_fail',submitted+timedelta(seconds=5),s,story_id=sid,error_type=error_type)
            if c in retry:
                event(c,'memory_card_retry',submitted+timedelta(seconds=35),s,story_id=sid)
                if c not in recovered:event(c,'memory_card_create_fail',submitted+timedelta(seconds=50),s,story_id=sid,error_type=error_type)
        if c in successful:
            event(c,'memory_card_create_success',c['card_at'],s,story_id=sid,card_id=card_id)
            event(c,'memory_card_preview',c['card_at']+timedelta(seconds=5),s,story_id=sid,card_id=card_id)
            if r.random()<.7:event(c,'memory_card_download',c['card_at']+timedelta(seconds=10),s,card_id=card_id)
            if c in share_pool or r.random()<.3:event(c,'share_click',c['card_at']+timedelta(seconds=20),s,share_channel=r.choice(['facebook','zalo','copy_link']))
        if c in ugc:
            grant_t=c['card_at']+timedelta(seconds=30)
            story['ugc_consent_at']=iso(grant_t);story['submitted_to_community_at']=iso(grant_t+timedelta(seconds=2))
            event(c,'ugc_usage_consent_granted',grant_t,s,story_id=sid)
            event(c,'ugc_submission',grant_t+timedelta(seconds=2),s,story_id=sid)
            if story['community_status']!='pending':story['moderated_at']=iso(grant_t+timedelta(hours=12))
    # Contact times and consent are planned before normalizing the point-in-time IDs on all events.
    for c in contact_customers:
        source=c.get('consent_source','create')
        c['contact_at']=(datetime.fromisoformat(c['return_session']['start_at'])+timedelta(minutes=3) if source=='connect' else c['card_at']+timedelta(minutes=4 if source=='share' else 1))
        if c in leads:c['lead_at']=c['contact_at']+timedelta(seconds=2)
        s=c['return_session'] if source=='connect' else c['first_session']
        for j,typ in enumerate(['zalo','email'] if c['ctype']=='both' else [c['ctype']]):event(c,'contact_info_submitted',c['contact_at']+timedelta(seconds=j),s,contact_type=typ,contact_valid=True)
    def impression(c,source,t,s,grants=False):
        impression_id=f'CI{len([e for e in data["events"] if e["event_name"]=="marketing_consent_shown"])+1:04}'
        event(c,'marketing_consent_shown',t,s,consent_source=source,consent_impression_id=impression_id)
        if grants:event(c,'marketing_consent_granted',c['lead_at'],s,consent_source=source,consent_impression_id=impression_id)
        elif r.random()<.65:event(c,'marketing_consent_declined',t+timedelta(seconds=15),s,consent_source=source,consent_impression_id=impression_id)
    for c in successful:
        impression(c,'create',c['card_at']+timedelta(seconds=40),c['first_session'],c.get('consent_source')=='create')
    for c in share_pool:
        impression(c,'share',c['card_at']+timedelta(minutes=3),c['first_session'],c.get('consent_source')=='share')
    for c in connect_pool:
        impression(c,'connect',datetime.fromisoformat(c['return_session']['start_at'])+timedelta(minutes=2),c['return_session'],c.get('consent_source')=='connect')
    for c in leads:
        t=c['lead_at']+timedelta(minutes=15);c['delivery_at']=t
        message_id=f'MSG{leads.index(c)+1:03}';workflow_id='FOLLOWUP_INITIAL';channel='zalo' if c['ctype'] in ['zalo','both'] else 'email'
        body=(data['campaign']['template_b'] if c['group']=='B' else data['campaign']['template_a']).replace('{theme}',THEMES[c['theme']])
        record={'message_id':message_id,'workflow_id':workflow_id,'visitor_id':c['id'],'user_id':c['uid'],'ab_group':c['group'],'channel':channel,'body':body,'status':'delivered','triggered_at':iso(t-timedelta(seconds=2)),'delivered_at':iso(t),'opened_at':None,'clicked_at':None,'block_reason':None}
        event(c,'workflow_triggered',t-timedelta(seconds=2),workflow_id=workflow_id,message_id=message_id,message_type='ca_nhan_hoa' if c['group']=='B' else 'chung')
        event(c,'followup_delivered',t,message_id=message_id,channel=channel,message_type='ca_nhan_hoa' if c['group']=='B' else 'chung')
        if c in openedA+openedB:
            record['opened_at']=iso(t+timedelta(minutes=10));event(c,'followup_open',t+timedelta(minutes=10),message_id=message_id,channel=channel)
        if c in clickA+clickB:
            click_t=t+timedelta(minutes=15);record['clicked_at']=iso(click_t);c['mql_at']=click_t
            event(c,'followup_click',click_t,message_id=message_id,channel=channel)
            c['product_session']=session(c,click_t+timedelta(seconds=1),channel if channel=='zalo' else 'direct','followup')
        elif c in mqlA+mqlB:
            c['product_session']=session(c,t+timedelta(hours=1),r.choice(['direct','zalo']),'product_return')
            c['mql_at']=datetime.fromisoformat(c['product_session']['start_at'])+timedelta(seconds=20)
        data['followups'].append(record)
        if c in withdrew:
            c['withdraw_at']=t+timedelta(days=2);event(c,'marketing_consent_withdrawn',c['withdraw_at'],channel='all',consent_source=c['consent_source'])
    for j,c in enumerate(contact_only[:8]+[c for c in cs if 'ctype' not in c][:4]+withdrew):
        t=(c['withdraw_at']+timedelta(minutes=5) if c in withdrew else c['first']+timedelta(minutes=20))
        reason='chua_dong_y' if 'ctype' in c else 'khong_co_lien_he'
        mid=f'BLOCK{j+1:03}';event(c,'workflow_blocked',t,workflow_id='FOLLOWUP_INITIAL',message_id=mid,block_reason=reason)
        data['followups'].append({'message_id':mid,'workflow_id':'FOLLOWUP_INITIAL','visitor_id':c['id'],'user_id':c.get('uid'),'ab_group':c.get('group'),'channel':None,'body':None,'status':'blocked','triggered_at':iso(t),'delivered_at':None,'opened_at':None,'clicked_at':None,'block_reason':reason})
    products={p['product_id']:p for p in data['products']}
    def target_product(c):
        base=bases[c['theme']][0];j=c.get('order_index',c['i'])%4
        return products[base if j==0 else f'{base}-{j+1}']
    for c in mqlA+mqlB:
        s=c['product_session'];t=datetime.fromisoformat(s['start_at'])+timedelta(seconds=20);product=target_product(c)
        event(c,'collection_cta_impression',t-timedelta(seconds=5),s,cta_location='memory_followup')
        event(c,'product_collection_click',t-timedelta(seconds=2),s,cta_location='memory_followup')
        event(c,'product_collection_view',t,s,collection_id=c['theme'])
        event(c,'product_detail_view',t+timedelta(seconds=30),s,product_id=product['product_id'],price=product['price'],from_recommendation=c['group']=='B')
        if c['group']=='B':event(c,'ai_recommendation_shown',t-timedelta(seconds=1),s,recommended_product_ids=[product['product_id']])
        if c in sqlA+sqlB:
            c['sql_at']=t+timedelta(minutes=2);reason='add_to_cart' if (sqlA+sqlB).index(c)%2==0 else 'consult_request'
            c['sql_reason']=reason
            event(c,reason,c['sql_at'],s,product_id=product['product_id'],price=product['price'],quantity=1,channel='zalo' if reason=='consult_request' else 'online')
            if c not in buyers:event(c,'exit_no_purchase',c['sql_at']+timedelta(minutes=15),s,cart_value=product['price'])
    late_buyers=(boughtA+boughtB)[:2]
    for c in sqlA+sqlB:
        if c not in buyers or c in late_buyers:
            t=c['sql_at']+timedelta(hours=24)
            hid=f'HANDOFF{len(data["sales_handoffs"])+1:03}'
            event(c,'sales_handoff',t,handoff_id=hid,sql_reason=c['sql_reason'])
            data['sales_handoffs'].append({'handoff_id':hid,'visitor_id':c['id'],'sql_at':iso(c['sql_at']),'handed_off_at':iso(t),'reason':c['sql_reason'],'assigned_to':r.choice(['Tư vấn An','Tư vấn Bình','Tư vấn Linh']),'status':'converted' if c in late_buyers else 'pending','note':'Ưu tiên tư vấn bộ sản phẩm theo chủ đề khách đã xem.'})
    for j,c in enumerate(buyers):
        product=target_product(c)
        t=(c['sql_at']+timedelta(hours=36 if c in late_buyers else 4)) if c in boughtA+boughtB else c['contact_at']+timedelta(days=2)
        voucher=data['vouchers'][1 if c['purchase_channel']=='store' else j%3] if c['purchase_channel']=='store' or j%3==0 else None
        # A fresh, verifiable campaign click precedes every online order without a voucher.
        click=None
        if c['purchase_channel']=='online' and not voucher:
            src=r.choice(['facebook','tiktok','youtube','zalo'])
            click=event(c,'campaign_link_click',t-timedelta(hours=1),utm_source=src,platform=src,utm_campaign='TTWR2026',content_id=content(src))
        s=session(c,t-timedelta(minutes=5),click['utm_source'] if click else 'direct','purchase')
        event(c,'product_collection_view',t-timedelta(minutes=4),s,collection_id=c['theme'])
        event(c,'product_detail_view',t-timedelta(minutes=3),s,product_id=product['product_id'],price=product['price'],from_recommendation=False)
        if c['purchase_channel']=='online':
            event(c,'add_to_cart',t-timedelta(minutes=2),s,product_id=product['product_id'],price=product['price'],quantity=1)
            event(c,'checkout_start',t-timedelta(minutes=1),s,cart_value=product['price'],item_count=1)
        discount=product['price']*15//100 if voucher else 0;total=product['price']-discount
        oid=f'ORDER{j+1:03}';code=voucher['code'] if voucher else None
        order={'order_id':oid,'visitor_id':c['id'],'user_id':c['uid'],'order_date':iso(t),'channel':c['purchase_channel'],'store_id':f'MK{j+1:03}' if c['purchase_channel']=='store' else None,'items':[{'product_id':product['product_id'],'quantity':1,'unit_price':product['price']}],'subtotal':product['price'],'discount_amount':discount,'order_value':total,'voucher_code':code,'campaign_attributed':True,'attributed_source':click['utm_source'] if click else c['source'],'attribution':{'reason':'campaign_voucher' if voucher else 'last_click_7_days','click_event_id':click['event_id'] if click else None},'first_purchase':True}
        data['orders'].append(order);c['purchase_at']=t
        event(c,'purchase' if c['purchase_channel']=='online' else 'voucher_redeem',t,s,order_id=oid,order_value=total,items=order['items'],voucher_code=code,store_id=order['store_id'],channel=c['purchase_channel'],campaign_attributed=True,attributed_source=order['attributed_source'])
        if voucher:voucher['redemptions']+=1
    # Normalize point-in-time identity/theme/group rather than backfilling final customer state.
    by_id={c['id']:c for c in cs}
    for e in data['events']:
        c=by_id[e['visitor_id']];t=datetime.fromisoformat(e['timestamp'])
        e['user_id']=c.get('uid') if c.get('contact_at') and t>=c['contact_at'] else None
        e['ab_group']=c.get('group') if c.get('lead_at') and t>=c['lead_at'] else None
        e['theme_id']=c.get('theme') if c.get('theme_at') and t>=c['theme_at'] else None
        if e['session_id']:
            s=all_sessions[e['session_id']]
            s['end_at']=max(s['end_at'],iso(t+timedelta(seconds=15)))
    for s in data['sessions']:
        c=by_id[s['visitor_id']]
        s['user_id']=c.get('uid') if c.get('contact_at') and datetime.fromisoformat(s['start_at'])>=c['contact_at'] else None
    data['events'].sort(key=lambda e:(e['timestamp'],e['event_id']))
    for c in cs:
        ev=[e for e in data['events'] if e['visitor_id']==c['id']]
        impressions=[{'consent_impression_id':e['consent_impression_id'],'source':e['consent_source'],'shown_at':e['timestamp']} for e in ev if e['event_name']=='marketing_consent_shown']
        history=[{'event_id':e['event_id'],'action':e['event_name'],'timestamp':e['timestamp'],'source':e.get('consent_source'),'consent_impression_id':e.get('consent_impression_id')} for e in ev if e['event_name'] in ['marketing_consent_granted','marketing_consent_declined','marketing_consent_withdrawn']]
        stage='Customer' if c in buyers else 'SQL' if c in sqlA+sqlB else 'MQL' if c in mqlA+mqlB else 'Lead' if c in leads else 'Khách ẩn danh'
        contact_info=None
        if 'ctype' in c:
            contact_info={'email':f'customer{c["i"]+1:04}@example.com' if c['ctype'] in ['email','both'] else None,'phone':f'09xx-xxx-{c["i"]+1:03}' if c['ctype'] in ['zalo','both'] else None,'contact_valid':True,'is_mock':True}
        state='withdrawn' if c in withdrew else 'granted' if c in leads else 'declined' if any(h['action']=='marketing_consent_declined' for h in history) else 'unanswered' if impressions else 'not_asked'
        data['customers'].append({'visitor_id':c['id'],'user_id':c.get('uid'),'display_nickname':c['nick'],'first_visit':iso(c['first']),'last_visit':max(s['start_at'] for s in sessions_for[c['id']]),'source':c['source'],'device':c['device'],'acquisition_week':c['week'],'theme_id':c.get('theme'),'contact_type':c.get('ctype'),'contact_info':contact_info,'contact_at':iso(c['contact_at']) if 'contact_at' in c else None,'funnel_stage':stage,'entered_lead_funnel':c in leads,'stage_timestamps':{key:iso(c[field]) if field in c else None for key,field in [('lead','lead_at'),('mql','mql_at'),('sql','sql_at'),('customer','purchase_at')]},'ab_group':c.get('group'),'marketing_consent_status':state,'consent_source':c.get('consent_source'),'consent_impressions':impressions,'consent_history':history,'assigned_to':next((h['assigned_to'] for h in data['sales_handoffs'] if h['visitor_id']==c['id']),None),'sales_note':'Khách quan tâm chủ đề '+THEMES[c['theme']] if c in sqlA+sqlB else ''})
    for week,weight in enumerate([8,10,12,15,18,15,12,10],1):
        for source,ad,production in [('facebook',1080000,320000),('tiktok',840000,240000),('youtube',240000,160000),('zalo',240000,80000)]:
            for kind,base in [('quang_cao',ad),('noi_dung',production)]:data['campaign_costs'].append({'cost_id':f'COST{len(data["campaign_costs"])+1:03}','week':week,'channel':source,'cost_type':kind,'amount':base*weight//100})
        for source in ['facebook','tiktok','youtube']:
            for n in [1,2]:
                cid=f'{source.upper()}_VIDEO_{n}'
                clicks=sum(1 for e in data['events'] if e['event_name']=='campaign_link_click' and e.get('content_id')==cid and (datetime.fromisoformat(e['timestamp'])-START).days//7+1==week)
                impressions=clicks*r.randrange(35,65)+r.randrange(100,250);starts=int(impressions*r.uniform(.35,.65));completed=int(starts*r.uniform(.25,.6))
                data['content_metrics'].append({'week':week,'platform':source,'content_id':cid,'format':'video','impressions':impressions,'reach':int(impressions*r.uniform(.65,.85)),'video_starts':starts,'video_completed':completed,'link_clicks':clicks,'public_hashtag_posts_reference':r.randrange(0,4),'scope':'aggregate_platform_statistics'})
    # Keep the illustrated first card reproducible when regenerating the fixture.
    first_story=max(data['stories'],key=lambda story:story['created_at'])
    first_story['photo_url']='/mock/images/story076-quan-ca-con.png'
    from generate_crm_mock import generate_crm
    data['crm']=generate_crm(data)
    return data

if __name__=='__main__':
    from validate_campaign_mock import validate
    dataset=generate()
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps(dataset,ensure_ascii=False,indent=2)+'\n')
    reread=json.loads(OUTPUT.read_text())
    report=validate(reread)
    (OUTPUT.parent/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'file':str(OUTPUT),'bytes':OUTPUT.stat().st_size,**report},ensure_ascii=False,indent=2))
