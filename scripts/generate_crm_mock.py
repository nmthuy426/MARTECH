"""Supplementary fictional family and lifecycle records, linked to the 400 visitors."""
def generate_crm(data):
    contacts=[c for c in data['customers'] if c['user_id']]
    families=[];children=[];consultations=[];history=[]
    for i,c in enumerate(contacts):
        fid='F'+c['visitor_id'];families.append({'id':fid,'visitorId':c['visitor_id'],'name':c['display_nickname'],'owner':['Thảo','Minh','An'][i%3]})
        for j in range(2 if i%4==0 else 1):
            child={'id':f'CH{c["visitor_id"]}-{j}','familyId':fid,'nickname':(['Bắp','Sóc','Gấu','Mây'][i%4]+(' Nhỏ' if j else '')),'birthday':f'{2018+i%6}-{1 if i%5==0 else 3+i%8:02}-{11 if i%5==0 else 5+i%20:02}','ageBand':['3–5 tuổi','6–8 tuổi','9–12 tuổi'][i%3],'theme':['gach_lego','bup_be','board_game','canh_dieu'][i%4],'budget':650000,'birthdayOptIn':i%3!=0};age=2026-int(child['birthday'][:4]);child['ageBand']='0–2 tuổi' if age<3 else '3–5 tuổi' if age<6 else '6–8 tuổi' if age<9 else '9–12 tuổi' if age<13 else '13+ tuổi';children.append(child)
        if i<30:
            consultations.append({'id':f'CONS{i:03}','familyId':fid,'childId':children[-1]['id'],'question':['Bé thích lắp ghép, ngân sách dưới 650.000đ','Cần hướng dẫn cách chơi cùng con','Muốn xem chất liệu và thông tin an toàn'][i%3],'status':'resolved' if i%3==0 else 'pending','owner':families[-1]['owner'],'createdAt':'2026-12-26T09:00:00+07:00','note':'Phụ huynh yêu cầu tư vấn; thông tin gợi ý cần nhân viên xác minh.'})
        if i%6==0: history.append({'id':f'HIST{i:03}','familyId':fid,'childId':children[-1]['id'],'date':'2026-09-01T10:00:00+07:00','amount':350000,'description':'Giao dịch trước campaign — chỉ phục vụ lịch sử chăm sóc, không tính doanh thu campaign'})
    links={o['order_id']:next(c['id'] for c in children if c['familyId']=='F'+o['visitor_id']) for o in data['orders'] if any(c['familyId']=='F'+o['visitor_id'] for c in children)}
    return {'families':families,'children':children,'consultations':consultations,'history':history,'orderLinks':links}
