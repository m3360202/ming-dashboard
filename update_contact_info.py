#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新商标信息.txt中的联系电话和邮箱
根据CSV文件中的contactPhone和contactEmail字段更新
"""

import csv
import os
import re
from pathlib import Path

# 配置路径
BASE_DIR = Path(__file__).parent / 'result' / '无效答辩'
CSV_FILE = BASE_DIR / 'ai_data_8(1).csv'

def read_csv_data():
    """读取CSV文件，返回以tmName为key的字典"""
    data = {}
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                tm_name = row.get('tmName', '').strip()
                if tm_name:
                    data[tm_name] = {
                        'contactPhone': row.get('contactPhone', '').strip(),
                        'contactEmail': row.get('contactEmail', '').strip()
                    }
        print(f'成功读取CSV文件，共 {len(data)} 条记录')
        return data
    except Exception as e:
        print(f'读取CSV文件失败: {e}')
        return {}

def update_trademark_info_file(folder_path, phone, email):
    """更新商标信息.txt文件中的联系电话和邮箱"""
    info_file = folder_path / '商标信息.txt'
    
    if not info_file.exists():
        print(f'  ⚠ 商标信息.txt 不存在: {info_file}')
        return False
    
    try:
        # 读取文件内容
        with open(info_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 更新联系电话
        # 匹配 "联系电话: xxxxx" 或 "联系电话：xxxxx"
        phone_pattern = r'(联系电话[：:]\s*)([^\n]*)'
        if re.search(phone_pattern, content):
            if phone and phone != '-':
                content = re.sub(phone_pattern, r'\1' + phone, content)
                print(f'  ✓ 更新联系电话: {phone}')
            else:
                print(f'  - 联系电话为空或"-"，跳过')
        else:
            print(f'  ⚠ 未找到联系电话字段')
        
        # 更新邮箱
        # 匹配 "邮箱：xxxxx" 或 "邮箱: xxxxx" 或 "邮箱： xxxxx"
        email_pattern = r'(邮箱[：:]\s*)([^\n]*)'
        if re.search(email_pattern, content):
            if email and email != '-':
                content = re.sub(email_pattern, r'\1' + email, content)
                print(f'  ✓ 更新邮箱: {email}')
            else:
                print(f'  - 邮箱为空或"-"，跳过')
        else:
            print(f'  ⚠ 未找到邮箱字段')
        
        # 写回文件
        with open(info_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f'  ✗ 更新文件失败: {e}')
        return False

def main():
    print('=' * 60)
    print('开始更新商标信息.txt中的联系电话和邮箱')
    print('=' * 60)
    print()
    
    # 读取CSV数据
    csv_data = read_csv_data()
    if not csv_data:
        print('CSV数据为空，退出')
        return
    
    # 获取所有客户文件夹
    if not BASE_DIR.exists():
        print(f'目录不存在: {BASE_DIR}')
        return
    
    # 排除CSV文件本身
    folders = [f for f in BASE_DIR.iterdir() 
               if f.is_dir() and f.name != 'A级客户' and f.name != 'B级客户' and f.name != 'C级客户']
    
    print(f'找到 {len(folders)} 个客户文件夹')
    print()
    
    updated_count = 0
    not_found_count = 0
    skipped_count = 0
    
    # 遍历每个文件夹
    for folder in folders:
        tm_name = folder.name
        print(f'处理: {tm_name}')
        
        # 查找CSV中对应的数据
        if tm_name not in csv_data:
            print(f'  ⚠ CSV中未找到该商标: {tm_name}')
            not_found_count += 1
            print()
            continue
        
        data = csv_data[tm_name]
        phone = data.get('contactPhone', '')
        email = data.get('contactEmail', '')
        
        # 如果两者都为空或"-"，跳过
        if (not phone or phone == '-') and (not email or email == '-'):
            print(f'  - 联系电话和邮箱都为空，跳过')
            skipped_count += 1
            print()
            continue
        
        # 更新文件
        if update_trademark_info_file(folder, phone, email):
            updated_count += 1
        print()
    
    # 输出统计信息
    print('=' * 60)
    print('更新完成！')
    print(f'成功更新: {updated_count} 个')
    print(f'未找到: {not_found_count} 个')
    print(f'跳过: {skipped_count} 个')
    print('=' * 60)

if __name__ == '__main__':
    main()

