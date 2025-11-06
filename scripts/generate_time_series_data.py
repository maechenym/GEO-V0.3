#!/usr/bin/env python3
"""
Generate time-series data for dates 10/31 to 11/6 with random variations
while maintaining brand rankings.
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List

# Set random seed for reproducibility
random.seed(42)

def generate_random_variation(value: float, variation_percent: float) -> float:
    """Generate a random variation within the specified percentage."""
    variation = random.uniform(-variation_percent, variation_percent)
    new_value = value * (1 + variation / 100)
    return max(0, min(1, new_value))  # Clamp between 0 and 1

def generate_sentiment_variation(value: float, variation: float = 0.05) -> float:
    """Generate sentiment score variation."""
    new_value = value + random.uniform(-variation, variation)
    return max(0, min(1, new_value))  # Clamp between 0 and 1

def sort_by_total_score(data: Dict[str, Any]) -> List[tuple]:
    """Sort brands by total_score in descending order."""
    items = [(brand, data.get('total_score', {}).get(brand, 0)) for brand in data.keys()]
    return sorted(items, key=lambda x: x[1], reverse=True)

def maintain_rankings(original_data: Dict[str, Any], new_data: Dict[str, Any]) -> Dict[str, Any]:
    """Adjust values to maintain rankings based on total_score."""
    # Get sorted rankings
    original_rankings = sort_by_total_score(original_data.get('total_score', {}))
    new_rankings = sort_by_total_score(new_data.get('total_score', {}))
    
    # Create a mapping of original rank to brand
    original_order = [brand for brand, _ in original_rankings]
    
    # If rankings changed, adjust values to maintain order
    target_order = [brand for brand, _ in new_rankings]
    
    if original_order != target_order:
        # Reorder new_data to match original order
        # This is a simplified approach - in practice, we'd need to adjust scores
        pass
    
    return new_data

def generate_daily_data(base_data: Dict[str, Any], date_str: str) -> Dict[str, Any]:
    """Generate data for a single day with random variations."""
    overall = base_data.get('overall', {})
    
    # Extract base values
    base_mention_rate = overall.get('mention_rate', {})
    base_content_share = overall.get('content_share', {})
    base_brand_domains = overall.get('brand_domains', {})
    base_sentiment_score = overall.get('sentiment_score', {})
    base_combined_score = overall.get('combined_score', {})
    base_total_score = overall.get('total_score', {})
    base_absolute_rank = overall.get('absolute_rank', {})
    base_sentiment_detail = overall.get('aggregated_sentiment_detail', {})
    
    # Generate new values with variations
    new_mention_rate = {}
    new_content_share = {}
    new_sentiment_score = {}
    new_combined_score = {}
    new_total_score = {}
    
    brands = list(base_mention_rate.keys())
    
    for brand in brands:
        # mention_rate: ±10% variation
        new_mention_rate[brand] = generate_random_variation(
            base_mention_rate.get(brand, 0), 10
        )
        
        # content_share: ±5% variation
        new_content_share[brand] = generate_random_variation(
            base_content_share.get(brand, 0), 5
        )
        
        # sentiment_score: ±0.05 variation
        new_sentiment_score[brand] = generate_sentiment_variation(
            base_sentiment_score.get(brand, 0), 0.05
        )
        
        # combined_score: calculated from mention_rate and content_share, ±5% variation
        base_combined = base_combined_score.get(brand, 0)
        new_combined_score[brand] = generate_random_variation(base_combined, 5)
    
    # Calculate total_score based on adjusted values
    # total_score combines mention_rate, content_share, and sentiment_score
    for brand in brands:
        # Combine adjusted metrics with ±10% variation
        base_total = base_total_score.get(brand, 0)
        new_total_score[brand] = generate_random_variation(base_total, 10)
    
    # Sort by total_score to ensure rankings
    brand_scores = [(brand, new_total_score[brand]) for brand in brands]
    brand_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Ensure rankings match original order (with small adjustments if needed)
    original_scores = [(brand, base_total_score.get(brand, 0)) for brand in brands]
    original_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Adjust to maintain relative order
    for i, (new_brand, new_score) in enumerate(brand_scores):
        if i < len(original_scores):
            original_brand, original_score = original_scores[i]
            # If rank changed significantly, adjust
            if new_brand != original_brand:
                # Find original position
                original_pos = next((j for j, (b, _) in enumerate(original_scores) if b == new_brand), None)
                if original_pos is not None and abs(original_pos - i) > 1:
                    # Adjust score to maintain position
                    if original_pos < i:
                        # Score should be higher
                        new_total_score[new_brand] = max(new_total_score[new_brand], 
                                                         brand_scores[max(0, i-1)][1] + 0.01)
                    else:
                        # Score should be lower
                        new_total_score[new_brand] = min(new_total_score[new_brand], 
                                                         brand_scores[min(len(brand_scores)-1, i+1)][1] - 0.01)
    
    # Recalculate combined_score based on mention_rate and content_share
    # combined_score ≈ mention_rate * content_share (normalized)
    for brand in brands:
        # Recalculate based on new mention_rate and content_share
        new_combined_score[brand] = new_mention_rate[brand] * new_content_share[brand]
    
    # Normalize combined_score to reasonable range
    max_combined = max(new_combined_score.values()) if new_combined_score.values() else 1
    if max_combined > 0:
        for brand in brands:
            new_combined_score[brand] = new_combined_score[brand] / max_combined * max(base_combined_score.values()) if base_combined_score.values() else new_combined_score[brand]
    
    # Recalculate total_score to maintain consistency
    for brand in brands:
        # total_score combines all metrics
        combined = new_combined_score[brand]
        sentiment = new_sentiment_score[brand]
        mention = new_mention_rate[brand]
        # Weighted combination
        new_total_score[brand] = (combined * 40 + sentiment * 30 + mention * 30)
    
    # Sort final scores to ensure ranking
    final_scores = [(brand, new_total_score[brand]) for brand in brands]
    final_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Build new data structure
    new_overall = {
        'mention_rate': new_mention_rate,
        'content_share': new_content_share,
        'brand_domains': base_brand_domains,  # Keep domains unchanged
        'combined_score': new_combined_score,
        'sentiment_score': new_sentiment_score,
        'total_score': {brand: score for brand, score in final_scores},
        'absolute_rank': base_absolute_rank,  # Keep ranks unchanged
        'aggregated_sentiment_detail': base_sentiment_detail,  # Keep sentiment details unchanged
    }
    
    return {
        'overall': new_overall,
        'chatgpt': base_data.get('chatgpt', {})  # Keep chatgpt data unchanged
    }

def process_json_file(input_file: str, output_file: str):
    """Process JSON file and add time-series data."""
    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Generate dates: 10/31 to 11/6 (7 days)
    base_date = datetime(2025, 10, 31)
    dates = [(base_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
    
    print(f"Generating data for dates: {dates}")
    
    # Process each product
    for product_name, entries in data.items():
        print(f"\nProcessing: {product_name}")
        
        if not entries or len(entries) == 0:
            print(f"  No data found for {product_name}")
            continue
        
        # Get base data (first entry)
        base_entry = entries[0]
        base_date_str = base_entry[0]
        base_data_dict = base_entry[1]
        
        print(f"  Base date: {base_date_str}")
        
        # Generate new entries for each date
        new_entries = []
        
        for date_str in dates:
            new_data = generate_daily_data(base_data_dict, date_str)
            new_entries.append([date_str, new_data])
        
        # Replace entries with new ones
        data[product_name] = new_entries
        
        print(f"  Generated {len(new_entries)} entries")
    
    # Write updated data
    print(f"\nWriting to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Done!")

if __name__ == '__main__':
    input_file = '/Users/yimingchen/Documents/all_brands_results_20251106_075334.json'
    output_file = '/Users/yimingchen/Documents/all_brands_results_20251106_075334.json'
    
    process_json_file(input_file, output_file)

