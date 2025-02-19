'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './style.css';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';

interface TrademarkItem {
  rejectDate: string;
  createTime: string;
  appDate: string;
  add_time: string;
  applicantCn: string;
  logoUrl: string;
  tmName: string;
  statusName: string;
  acceptDate: string;
  rescindDate: string;
  agent: string;
  intCls: string;
  regNo: string;
  operName: string;
  addressCn: string;
  contactPhone: string;
  contactEmail: string;
  clueWithCustomerVo: {
    fcontactPhone: string;
    fcontactEmail: string;
  };
}

export function ItemsTable7() {
  const productsPerPage = 20;
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [data, setData] = useState<TrademarkItem[]>([]);
  const [pageTotal, setPageTotal] = useState(0);
  const [date, setDate] = useState<string | null>(null);
  const [listData, setListData] = useState<TrademarkItem[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const generateDates = () => {
      const startDate = new Date('2025-02-20');
      const currentDate = new Date();
      const datesArray = [];
      while (startDate <= currentDate) {
        datesArray.push(startDate.toISOString().split('T')[0]);
        startDate.setDate(startDate.getDate() + 1);
      }
      setDates(datesArray);
    };
    generateDates();
  }, []);

  const getData = async (date: string | null) => {
    if (date) {
      try {
        const res = await axios.post('https://ai.aliensoft.com.cn/api/loadData7', {
          date
        });

        if (res?.data?.success) {
          setData(res?.data?.data);
          setPageTotal(res?.data?.total);
        } else {
          alert('请求失败');
        }
      } catch (error) {
        console.log('error', error);
        alert('请求失败');
      }
    }
  };

  const getListData = async () => {
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/getData7List', {
        pageStart: pageIndex
      });

      if (res?.data?.success) {
        setListData(res?.data?.data);
        setPageTotal(res?.data?.total);
      } else {
        alert('请求失败');
      }
    } catch (error) {
      console.log('error', error);
      alert('请求失败');
    }
  };

  useEffect(() => {
    getListData();
  }, [pageIndex]);

  useEffect(() => {
    getData(date);
  }, [date]);

  const currentData = data.slice(
    (pageIndex - 1) * productsPerPage,
    pageIndex * productsPerPage
  );

  function calculateDaysOrApply(startDateString: string): string {
    const startDate = new Date(startDateString);
    const currentDate = new Date();
    if (startDate > currentDate) {
      return "驳回发文";
    } else {
      const diffTime = currentDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} 天前 | 驳回发文`;
    }
  }

  const escapeCommas = (value: string) => {
    if (value && value.includes(',')) {
      return `"${value}"`;
    }
    return value;
  };

  const exportToCSV = () => {
    const headers = [
      '商标名称',
      '类目',
      '申请人',
      '联系人',
      '联系电话',
      '联系邮箱',
      '联系地址',
      '注册号',
      '状态',
      '申请日期',
      '更新日期',
      '驳回日期',
      '代理机构'
    ];

    const csvData = [
      headers.join(','),
      ...data.map(product => [
        product.tmName,
        product.intCls,
        product.applicantCn,
        product.operName,
        escapeCommas(product.contactPhone),
        escapeCommas(product.contactEmail),
        product.addressCn,
        product.regNo,
        product.statusName,
        product.appDate,
        product.rescindDate,
        product.rejectDate,
        product.agent
      ].join(','))
    ].join('\r\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

      const fileName = `${formattedDate} 无效答辩潜在客户数据.csv`;
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-row justify-between items-center'>
          <span style={{ color: '#637381', fontSize: '14px', fontWeight: '400'}}>经过AI比对，正在驳回的快照，的潜在用户将会被列出在这里，具体算法请看PDF</span>
          <div className="flex flex-row gap-4 items-center">
            <select style={{padding: '8px 10px', border: '#ccc 1px solid', borderRadius: '8px'}} value={date || ''} onChange={(e) => setDate(e.target.value)}>
              <option value="">选择日期</option>
              {dates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={exportToCSV}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                导出数据
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ gap: '30px', marginTop: '10px' }} className="w-full flex flex-col justify-start items-center flex-wrap">
          {listData.map((product, index) => (
            <div key={index} style={{ border: '#ccc 1px solid', borderRadius: '10px', marginBottom: '12px' }} className='w-full p-4 gap-2 flex flex-row items-center justify-start gap-2'>
              <div style={{ width: '100px', height: '100px', border: '#ccc 1px solid', borderRadius: '10px', padding: '8px' }} className="flex justify-center items-center overflow-hidden">
                <img
                  src={product.logoUrl}
                  alt="Product Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className='flex flex-col ml-4'>
                <div className='w-full gap-4 flex items-center justify-start gap-2'>
                  <span className="text-[14px] font-[800]">{product.tmName}</span>
                  <span style={{ color: '#fa9d3b' }} className="text-[14px] font-[800]">{product.statusName}</span>
                  <span style={{ color: '#f30000', backgroundColor: '#FFF0F5', borderRadius: '6px' }} className="text-[14px] px-4 py-1">{calculateDaysOrApply(product.rejectDate)}</span>
                  <span style={{color: '#fa9d3'}} className="text-[14px] font-[800]">申请人：{product?.applicantCn}</span>
                  <span style={{ color: '#6f67f0' }} className="text-[14px] font-[800]">代理机构：{product.agent}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{ color: '#1485ee' }} className="text-[14px] font-[800]">类目：{product.intCls}</span>
                  <span style={{ color: '#ccc' }} className="text-[14px] font-[800]"> | </span>
                  <span style={{ color: '#ffc300' }} className="text-[14px] font-[800] ">{product.regNo}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{ color: '#637381' }} className="text-[14px] font-[800] ">申请日期: {product.appDate}</span>
                  <span style={{ color: '#ccc' }} className="text-[14px] font-[800]"> | </span>
                  <span style={{ color: '#637381' }} className="text-[14px] font-[800] ">更新日期: {product.createTime}</span>
                  <span style={{ color: '#ccc' }} className="text-[14px] font-[800]"> | </span>
                  <span style={{ color: '#f30000' }} className="text-[14px] font-[800] ">驳回发文: {product.rejectDate}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{ color: '#1c252e' }} className="text-[14px] font-[800]">联系人：{product.operName}</span>
                  <span style={{ color: '#ccc' }} className="text-[14px] font-[800]"> | </span>
                  <span style={{ color: '#1c252e' }} className="text-[14px] font-[800] ">联系地址: {product.addressCn}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{ color: '#1c252e' }} className="text-[14px] font-[800] ">联系电话：{product.contactPhone}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{ color: '#1c252e' }} className="text-[14px] font-[800] ">联系邮箱：{product.contactEmail}</span>
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
              {Math.max(0, (pageIndex - 1) * productsPerPage + 1)}-{Math.min(pageIndex * productsPerPage, pageTotal)}
            </strong>{' '}
            中 <strong>{pageTotal}</strong> 个数据
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
