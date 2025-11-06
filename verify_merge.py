#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证品牌合并结果"""

import json

with open("/Users/yimingchen/Downloads/all_brands_results_20251106_075334.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

product = data['英业达 (Inventec) 机架解决方案']
entry = product[0][1]['overall']

brands = list(entry['mention_rate'].keys())
hpe_brands = [b for b in brands if 'hpe' in b.lower() or '惠普' in b]
huawei_brands = [b for b in brands if 'huawei' in b.lower() or '华为' in b]

print('合并后HPE相关品牌:', hpe_brands)
print('合并后华为相关品牌:', huawei_brands)

print('\n验证HPE数据:')
if 'HPE' in entry['mention_rate']:
    print(f"  HPE mention_rate: {entry['mention_rate']['HPE']}")
    print(f"  HPE total_score: {entry['total_score'].get('HPE', 'N/A')}")
else:
    print("  HPE不存在")

print('\n验证华为数据:')
if '华为' in entry['mention_rate']:
    print(f"  华为 mention_rate: {entry['mention_rate']['华为']}")
    print(f"  华为 total_score: {entry['total_score'].get('华为', 'N/A')}")
else:
    print("  华为不存在")

print('\n所有品牌列表（前10个）:')
for i, brand in enumerate(brands[:10]):
    print(f"  {i+1}. {brand}")

