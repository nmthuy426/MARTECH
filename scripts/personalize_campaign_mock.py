"""Give the fixture unique display names and distinct Gallery cover images."""
import json
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]

def personalize(data):
    surnames=['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý','Đinh','Trịnh','Mai','Đào']
    names=['Minh Anh','Hoài An','Gia Hân','Bảo Ngọc','Tuấn Kiệt','Khánh Linh','Đức Minh','Thanh Vy','Nhật Nam','Thảo Nhi','Quỳnh Chi','Hải Đăng','Ngọc Hà','Anh Khoa','Phương Thảo','Bảo Trâm','Thiên Phúc','Khánh Duy','Yến Nhi','Quang Huy']
    mapping={c['visitor_id']:f'{surnames[i//20]} {names[i%20]}' for i,c in enumerate(data['customers'])}
    for customer in data['customers']:customer['display_nickname']=mapping[customer['visitor_id']]
    for story in data['stories']:story['nickname']=mapping[story['visitor_id']]
    for family in data.get('crm',{}).get('families',[]):
        if family.get('visitorId') in mapping:family['name']=mapping[family['visitorId']]
    # Reuse the Campaign's existing toy photography, keeping covers reproducible.
    images=[]
    for page in ['page2-select','page5-product','page1-intro']:
        html=(ROOT/f'src/app/pages/{page}/{page}.html').read_text()
        images.extend(re.findall(r'<img[^>]+src="(https://[^\"]+)"',html))
    gallery=sorted((s for s in data['stories'] if s['community_status']=='approved' and s['ugc_usage_consent'] and s['submitted_to_community']),key=lambda s:(s['featured'],s['created_at']),reverse=True)
    # Each of the first nine visible cards has a different cover.
    for story,image in zip(gallery[:9],images):story['photo_url']=image
    assert len(set(mapping.values()))==400
    assert len({s['photo_url'] for s in gallery[:9]})==9
    return data

if __name__=='__main__':
    path=ROOT/'public/mock/mykingdom_campaign_mock_400.json'
    data=personalize(json.loads(path.read_text()))
    from validate_campaign_mock import validate
    report=validate(data)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    (path.parent/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False))
