'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './style.css';
import { textMark } from '@/utils/chesandabian';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';

export function ItemsTable9() {
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

  const getData = async (pageNo: number) => {
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/loadData9', {
        pageNo: pageNo,
        pageSize: 500
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
  };

  useEffect(() => {
    getData(pageIndex);
  }, [pageIndex]);

  function calculateDaysOrApply(startDateString: string): string {
    // 将输入的字符串转换为日期对象
    const startDate = new Date(startDateString);
    
    // 获取当前日期
    const currentDate = new Date();
    // 比较两个日期
    if (startDate > currentDate) {
        // 如果传入的日期是未来的日期，返回“申请收文”
        return "申请收文";
    } else {
        // 计算两个日期之间的时间差（毫秒）
        const diffTime = currentDate.getTime() - startDate.getTime();
        
        // 将时间差转换为天数
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // 返回“xx天前”
        return `${diffDays}天前 | 申请收文`;
    }
}

const escapeCommas = (value: string) => {
  if (value.includes(',')) {
    return `"${value}"`;
  }
  return value;
};

const exportToCSV = () => {
  const headers = [
    '商标名称',
    '类目',
    '联系人',
    '联系电话',
    '联系邮箱',
    '联系地址',
    '注册号',
    '状态',
    '无效申请收文',
    '无效受通发文',
    '代理机构'
  ];

  const csvData = [
    headers.join(','),
    ...data.map(product => [
      product.tmName,
      product.intCls,
      product.operName,
      escapeCommas(product.clueWithCustomerVo.fcontactPhone),
      escapeCommas(product.clueWithCustomerVo.fcontactEmail),
      product.addressCn,
      product.regNo,
      product.statusName,
      product.acceptDate,
      product.rescindDate,
      product.agent
    ].join(','))
  ].join('\r\n');

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

    // 设置下载文件名
    const fileName = `${formattedDate} 撤三答辩潜在客户数据.csv`;
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
            <span>经过AI比对，撤三答辩风险大于60分，的潜在用户将会被列出在这里，具体算法请看PDF</span>
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={exportToCSV}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                导出数据
              </span>
            </Button>
          </div>
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
                  <span style={{color: '#f30000', backgroundColor: '#FFF0F5', borderRadius: '6px'}} className="text-[14px] px-4 py-1">{calculateDaysOrApply(product?.acceptDate)}</span>
                  <span style={{color: '#6f67f0'}} className="text-[14px] font-[800]">代理机构：{product?.agent}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1485ee'}} className="text-[14px] font-[800]">类目：{product?.intCls}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#ffc300'}} className="text-[14px] font-[800] ">{product?.regNo}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800] ">无效申请收文: {product?.acceptDate}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800] ">无效受通发文: {product?.rescindDate}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800]">联系人：{product?.operName}</span>
                  <span style={{color: '#ccc'}} className="text-[14px] font-[800]"> | </span>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800] ">联系地址: {product?.addressCn}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800] ">联系电话：{product?.contactPhone}</span>
                </div>
                <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                  <span style={{color: '#1c252e'}} className="text-[14px] font-[800] ">联系邮箱：{product?.contactEmail}</span>
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
            中 <strong>{data.length}</strong> 条数据
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
