#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新生成数据文件，为10月31日至11月5日生成时间序列数据
确保排名不变，按照指定波动范围调整各项指标
"""

import json
import random
from datetime import datetime, timedelta
from copy import deepcopy

# 设置随机种子以确保可重复性（可选）
random.seed(42)

def apply_fluctuation(value, min_change, max_change):
    """应用随机波动"""
    change_percent = random.uniform(min_change, max_change)
    return value * (1 + change_percent)

def generate_date_range(start_date_str, end_date_str):
    """生成日期范围"""
    start = datetime.strptime(start_date_str, "%Y-%m-%d")
    end = datetime.strptime(end_date_str, "%Y-%m-%d")
    dates = []
    current = start
    while current <= end:
        dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)
    return dates

def get_ranked_brands(data_dict):
    """获取按值排序的品牌列表（降序）"""
    items = [(brand, value) for brand, value in data_dict.items()]
    items.sort(key=lambda x: x[1], reverse=True)
    return [item[0] for item in items]

def preserve_ranking_for_scores(original_scores, fluctuation_range):
    """调整分数并保持排名不变"""
    ranked_brands = get_ranked_brands(original_scores)
    adjusted_scores = {}
    
    # 为每个品牌生成调整后的分数
    temp_scores = {}
    for brand in ranked_brands:
        original_value = original_scores[brand]
        adjusted_value = apply_fluctuation(original_value, fluctuation_range[0], fluctuation_range[1])
        adjusted_value = max(0, adjusted_value)
        temp_scores[brand] = adjusted_value
    
    # 检查排名是否改变
    new_ranked_brands = get_ranked_brands(temp_scores)
    
    # 如果排名改变了，需要调整
    if new_ranked_brands != ranked_brands:
        # 按原始排名顺序重新分配分数，确保排名不变
        # 策略：保持相对差距，但整体应用波动
        sorted_original = [(brand, original_scores[brand]) for brand in ranked_brands]
        sorted_adjusted = []
        
        for i, (brand, original_value) in enumerate(sorted_original):
            # 应用波动
            adjusted_value = apply_fluctuation(original_value, fluctuation_range[0], fluctuation_range[1])
            adjusted_value = max(0, adjusted_value)
            
            # 确保与前面的品牌保持正确的相对关系
            if i > 0:
                prev_value = sorted_adjusted[i-1][1]
                if original_value > sorted_original[i-1][1]:
                    # 当前品牌应该比前一个品牌分数高
                    adjusted_value = max(adjusted_value, prev_value + 0.0001)
                elif original_value < sorted_original[i-1][1]:
                    # 当前品牌应该比前一个品牌分数低
                    adjusted_value = min(adjusted_value, prev_value - 0.0001)
            
            sorted_adjusted.append((brand, adjusted_value))
        
        # 转换为字典
        for brand, value in sorted_adjusted:
            adjusted_scores[brand] = value
    else:
        adjusted_scores = temp_scores
    
    return adjusted_scores

def adjust_metrics(base_data, dates):
    """为每个日期生成调整后的数据"""
    result = []
    
    for date_str in dates:
        day_data = deepcopy(base_data)
        
        # 1. 调整 mention_rate: ±10%，保持排名
        if 'mention_rate' in day_data.get('overall', {}):
            original_rates = day_data['overall']['mention_rate']
            adjusted_rates = preserve_ranking_for_scores(original_rates, (-0.10, 0.10))
            
            # 确保值在0-1范围内
            for brand in adjusted_rates:
                adjusted_rates[brand] = max(0, min(1, adjusted_rates[brand]))
            
            day_data['overall']['mention_rate'] = adjusted_rates
            
            # 同样调整chatgpt中的数据
            if 'chatgpt' in day_data and 'mention_rate' in day_data['chatgpt']:
                day_data['chatgpt']['mention_rate'] = adjusted_rates.copy()
        
        # 2. 调整 content_share: ±5%（不需要保持排名）
        if 'content_share' in day_data.get('overall', {}):
            original_shares = day_data['overall']['content_share']
            adjusted_shares = {}
            
            for brand in original_shares.keys():
                original_value = original_shares[brand]
                adjusted_value = apply_fluctuation(original_value, -0.05, 0.05)
                adjusted_value = max(0, min(1, adjusted_value))
                adjusted_shares[brand] = adjusted_value
            
            day_data['overall']['content_share'] = adjusted_shares
            
            # 同样调整chatgpt中的数据
            if 'chatgpt' in day_data and 'content_share' in day_data['chatgpt']:
                day_data['chatgpt']['content_share'] = adjusted_shares.copy()
        
        # 3. brand_domains: 保持不变（不调整）
        
        # 4. 调整 combined_score: 基于mention_rate和content_share，波动≤±5%
        if 'combined_score' in day_data.get('overall', {}):
            original_scores = day_data['overall']['combined_score']
            adjusted_scores = {}
            
            # 获取当前的mention_rate和content_share
            mention_rates = day_data['overall']['mention_rate']
            content_shares = day_data['overall']['content_share']
            
            for brand in original_scores.keys():
                # 基于mention_rate和content_share重新计算combined_score
                if brand in mention_rates and brand in content_shares:
                    base_score = mention_rates[brand] * content_shares[brand]
                    # 应用≤±5%的波动
                    adjusted_score = apply_fluctuation(base_score, -0.05, 0.05)
                    adjusted_score = max(0, adjusted_score)
                    adjusted_scores[brand] = adjusted_score
                else:
                    # 如果品牌不在新数据中，使用原始值并应用波动
                    adjusted_score = apply_fluctuation(original_scores[brand], -0.05, 0.05)
                    adjusted_score = max(0, adjusted_score)
                    adjusted_scores[brand] = adjusted_score
            
            day_data['overall']['combined_score'] = adjusted_scores
            
            # 同样调整chatgpt中的数据
            if 'chatgpt' in day_data and 'combined_score' in day_data['chatgpt']:
                day_data['chatgpt']['combined_score'] = adjusted_scores.copy()
        
        # 5. 调整 sentiment_score: ±0.05
        if 'sentiment_score' in day_data.get('overall', {}):
            original_sentiments = day_data['overall']['sentiment_score']
            adjusted_sentiments = {}
            
            for brand in original_sentiments.keys():
                original_value = original_sentiments[brand]
                adjusted_value = original_value + random.uniform(-0.05, 0.05)
                adjusted_value = max(0, min(1, adjusted_value))
                adjusted_sentiments[brand] = adjusted_value
            
            day_data['overall']['sentiment_score'] = adjusted_sentiments
            
            # 同样调整chatgpt中的数据
            if 'chatgpt' in day_data and 'sentiment_score' in day_data['chatgpt']:
                day_data['chatgpt']['sentiment_score'] = adjusted_sentiments.copy()
        
        # 6. 调整 total_score: ±10%，确保排名不变
        if 'total_score' in day_data.get('overall', {}):
            original_scores = day_data['overall']['total_score']
            adjusted_scores = preserve_ranking_for_scores(original_scores, (-0.10, 0.10))
            
            # 确保值非负
            for brand in adjusted_scores:
                adjusted_scores[brand] = max(0, adjusted_scores[brand])
            
            day_data['overall']['total_score'] = adjusted_scores
            
            # 同样调整chatgpt中的数据
            if 'chatgpt' in day_data and 'total_score' in day_data['chatgpt']:
                day_data['chatgpt']['total_score'] = adjusted_scores.copy()
        
        # 7. absolute_rank: 保持不变（不调整）
        
        # 8. aggregated_sentiment_detail: 根据sentiment_score变化调整
        # (保持原有结构，不做详细调整)
        
        result.append([date_str, day_data])
    
    return result

def main():
    input_file = "/Users/yimingchen/Downloads/all_brands_results_20251106_075334.json"
    output_file = "/Users/yimingchen/Downloads/all_brands_results_20251106_075334.json"
    
    print(f"正在读取文件: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 生成日期范围：10月31日至11月5日
    dates = generate_date_range("2025-10-31", "2025-11-05")
    print(f"生成日期范围: {dates}")
    
    # 为每个产品生成时间序列数据
    updated_data = {}
    
    for product_name, product_data in data.items():
        print(f"\n处理产品: {product_name}")
        
        # 找到11月6日的数据作为基准
        base_date_data = None
        for entry in product_data:
            if entry[0] == "2025-11-06":
                base_date_data = entry[1]
                break
        
        if base_date_data is None:
            # 如果没有11月6日的数据，使用最后一个数据
            print(f"  警告: 产品 {product_name} 没有11月6日的数据，使用最后一个数据作为基准")
            base_date_data = product_data[-1][1] if product_data else {}
        
        # 生成10月31日至11月5日的数据
        new_entries = adjust_metrics(base_date_data, dates)
        
        # 合并新数据和原有数据（保留11月6日的数据）
        updated_product_data = new_entries + [entry for entry in product_data if entry[0] == "2025-11-06"]
        
        # 按日期排序
        updated_product_data.sort(key=lambda x: x[0])
        
        updated_data[product_name] = updated_product_data
        print(f"  生成了 {len(new_entries)} 天的数据")
    
    # 保存更新后的数据
    print(f"\n正在保存文件: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, ensure_ascii=False, indent=2)
    
    print("\n数据生成完成！")
    print(f"已为所有产品生成了10月31日至11月5日的数据")
    print(f"11月6日的数据保持不变")

if __name__ == "__main__":
    main()
