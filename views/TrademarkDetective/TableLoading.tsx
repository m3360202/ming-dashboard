'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './style.css';
import { textMark } from '@/utils/origin';

interface TrademarkItem {
  // 根据你的数据结构添加属性
  image: string;
  similarity: number;
  classificationNumber: string;
  registrationNumber: string;
  status: string;
  applicant: string;
  applicationDate: string;
}

interface TrademarkCheckState {
  cls: string;
  st: string;
  keyword: string;
  sc: string;
}

export function ItemsTableLoading() {
  let productsPerPage = 20;
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageTotal, setPageTotal] = useState<number>(0);

  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // 计算当前页的数据
  const currentData = data.slice(
    (pageIndex - 1) * productsPerPage,
    pageIndex * productsPerPage
  );

  const LoadingSvg = () => (
    <svg width="50" height="50" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <circle className="spin" cx="400" cy="400" fill="none"
        r="200" strokeWidth="60" stroke="#1485ee"
        strokeDasharray="800 1400"
        strokeLinecap="round"
      />
    </svg>
  )

  // useEffect(() => {
  //   const data = JSON.parse(textMark);
  //   console.log('----------',data.data.list)
  //   setData(data.data.list);
  // }, [textMark])

  const calculateYears = (startDateString: string) => {
    // 将输入的字符串转换为日期对象
    const startDate = new Date(startDateString);
    
    // 获取当前日期
    const currentDate = new Date();
    
    // 计算两个日期之间的年份差
    let yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
    
    // 检查是否已满这些年
    if (currentDate.getMonth() < startDate.getMonth() || 
        (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() < startDate.getDate())) {
        yearsDiff -= 1;
    }
    
    return `注册已满 ${yearsDiff} 年`;
}

  return (
    <Card>
      <CardContent>
        <div style={{ gap: '30px', marginTop: '60px' }} className="w-full flex flex-col justify-start items-center flex-wrap">
          <LoadingSvg />
          <span>后台分析中...</span>
          <span>预计6小时 - 7日后更新数据</span>
        </div>
      </CardContent>
    </Card>
  );
}
