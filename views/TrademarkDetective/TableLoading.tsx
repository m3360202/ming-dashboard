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


  const getTag = (status: string) => {
    if (status === '已注册') {
      return (<div style={{ fontSize: '12px', color: '#07c160' }}>已注册</div>)
    }
    else if (status === '已驳回') {
      return (<div style={{ fontSize: '12px', color: '#f30000' }}>已驳回</div>)
    }
    else if (status === '商标无效') {
      return (<div style={{ fontSize: '12px', color: '#cccccc' }}>商标无效</div>)
    }
    else if (status === '注册申请中') {
      return (<div style={{ fontSize: '12px', color: '#fa9d3b' }}>注册申请中</div>)
    }
    else {
      return (<div style={{ fontSize: '12px', color: '#ffc300' }}>{status}</div>)
    }
  }

  const LoadingSvg = () => (
    <svg width="50" height="50" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <circle className="spin" cx="400" cy="400" fill="none"
        r="200" strokeWidth="60" stroke="#1485ee"
        strokeDasharray="800 1400"
        strokeLinecap="round"
      />
    </svg>
  )

  useEffect(() => {
    const data = JSON.parse(textMark);
    console.log('----------',data.data.list)
    setData(data.data.list);
  }, [textMark])

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
      <CardHeader>
        <CardDescription style={{ marginTop: '20px' }}>
          经过AI比对，无效答辩风险大于60分，的潜在奇特用户将会被列出在这里，具体算法请看PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ gap: '30px', marginTop: '60px' }} className="w-full flex flex-col justify-start items-center flex-wrap">
          {currentData.map((product: any, index: number) => (
            <div key={index} style={{ border: '#ccc 1px solid', borderRadius: '10px', marginBottom: '12px' }} className='w-full p-4 gap-2 flex flex-row items-center justify-start gap-2'>
              
              <div style={{ width: '100px', height: '80px', border: '#ccc 1px solid', borderRadius: '10px', padding: '20px' }} >
                <img src={product.logoUrl} style={{ width: '60px', height: '40px'}} />
              </div>
              <div className='flex flex-col ml-4'>
                <div className='w-full gap-4 flex items-center justify-start gap-2'>
                  <span className="text-[14px] font-[800]">{product?.tmName}</span>
                  <span style={{color: '#fa9d3b'}} className="text-[14px] font-[800]">{product?.statusName}</span>
                  <span style={{color: '#f30000', backgroundColor: '#FFF0F5', borderRadius: '6px'}} className="text-[14px] px-4 py-1">{calculateYears(product?.privateDateStart)}</span>
                  <span style={{color: '#6f67f0'}} className="text-[14px] font-[800]">代理机构：{product?.agent}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1485ee'}} className="text-[14px] font-[800]">类目：{product?.intCls}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#ffc300'}} className="text-[14px] font-[800] ">{product?.regNo}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800] ">注册日期: {product?.regDate}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800] ">终止日期: {product?.ent_es_date}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800] ">{product?.applicantCn}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800]">联系人：{product?.operName}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800] ">联系地址: {product?.addressCn}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800] ">联系电话：{product?.clueWithCustomerVo.fcontactPhone}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800] ">联系邮箱：{product?.clueWithCustomerVo.fcontactEmail}</span>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            展示
            <strong>
              {Math.max(0, (pageIndex - 1) * productsPerPage + 1)}-{Math.min(pageIndex * productsPerPage, data.length)}
            </strong>{' '}
            中 <strong>{data.length}</strong> 个商标
          </div>
          <div style={{ width: '200px' }} className="flex justify-between item-center">
            <div
              className='flex flex-row justify-center items-center gap-2'
              style={{ cursor: 'pointer' }}
              onClick={() => setPageIndex(Math.max(1, pageIndex - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              上一页
            </div>
            <div
              className='flex flex-row justify-center items-center gap-2 cursor-pointer'
              onClick={() => setPageIndex(pageIndex + 1)}
            >
              下一页
              <ChevronRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
