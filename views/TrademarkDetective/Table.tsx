'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsData } from '@/utils/trademarkCls';
import { useTrademarkCheck } from '@/store/trademarkPic';
import { PlusCircle } from 'lucide-react';
import axios from 'axios';
import './style.css';
import { textMark } from '@/utils/chesanfengxian';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';

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

export function ItemsTable() {
  let productsPerPage = 20;
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageTotal, setPageTotal] = useState<number>(0);

  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);


  // const submitCheck = async () => {
  //   if (!cls) {
  //     return alert('请选择国际分类');
  //   }
  //   if (!imageBase64) {
  //     return alert('请上传商标图片');
  //   }
  //   setLoading(true);
  //   const data = {
  //     //cls,
  //     img_src: imageBase64
  //   };

  //   const headers = {

  //   }

  //   setShowTestLogo(true);
  //   axios.post('https://gptserver.aliensoft.com.cn/handleGetQDSTrademarkPicList', data, {
  //     headers: headers
  //   }).then((res) => {
  //     setLoading(false);

  //     if (res?.data?.data) {
  //       const string = res?.data?.data.split('###{\"公告类型\":{},')[0]
  //       console.log('------', JSON.parse(string))
  //       const data = JSON.parse(string);
  //       setData(data);
  //       setPageTotal(Math.ceil((data.length || 0) / productsPerPage));
  //     } else {
  //       alert('request fail');
  //     }

  //   }).catch((error) => {
  //     setLoading(false);
  //     console.log('error', error);
  //     alert('request fail');
  //   });
  // };

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
    // const data = JSON.parse(textMark);
    console.log('----------',textMark)
    setData(textMark);
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
      calculateYears(product?.privateDateStart),
      product.agent
    ].join(','))
  ].join('\r\n');

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

    // 设置下载文件名
    const fileName = `${formattedDate} 撤三风险潜在客户数据.csv`;
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
            <span>经过AI比对风险维度，撤三风险大于60分，或24小时内没有其他知产代理公司代理的潜在用户将会被列出在这里，具体算法请看PDF</span>
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
