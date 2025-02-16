'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsData } from '@/utils/trademarkCls';
import { useTrademarkCheck } from '@/store/trademarkPic';
import { PlusCircle } from 'lucide-react';
import axios from 'axios';
import './style.css';

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

export function ItemsTablePic() {
  let router = useRouter();
  const { cls, st, keyword, sc }: TrademarkCheckState = useTrademarkCheck();
  let productsPerPage = 20;
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageTotal, setPageTotal] = useState<number>(0);
  const [showTestLogo, setShowTestLogo] = useState<boolean>(false);
  const [items, setItems] = useState<TrademarkItem[]>([]);
  const [imageBase64, setImageBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setImageBase64(base64);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const submitCheck = async () => {
    if (!cls) {
      return alert('请选择国际分类');
    }
    if (!imageBase64) {
      return alert('请上传商标图片');
    }
    setLoading(true);
    const data = {
      cls,
      img_src: imageBase64
    };

    const headers = {

    }

    setShowTestLogo(true);
    const url = 'https://gptserver.aliensoft.com.cn/handleGetTrademarkPicList';
    // const url = 'http://localhost:8080/handleGetTrademarkPicList'
    axios.post(url, data, {
      headers: headers
    }).then((res) => {
      setLoading(false);
      setData(res?.data?.data);
      setPageTotal(Math.ceil((res?.data?.pager?.total || 0) / productsPerPage));
    }).catch((error) => {
      setLoading(false);
      console.log('error', error);
      alert('request fail');
    });
  };

  // 计算当前页的数据
  const currentData = data.slice(
    (pageIndex - 1) * productsPerPage,
    pageIndex * productsPerPage
  );

  const getClsName = (cls: string) => {
    const result = clsData.filter(m => m.cls == cls);
    return result[0].name;
  }

  const getTag = (status: string) => {
    if (status === '已注册') {
      return (<div style={{ padding: '3px 12px', borderRadius: '10px', backgroundColor: '#07c160', color: '#fff' }}>已注册</div>)
    }
    else if (status === '已驳回') {
      return (<div style={{ padding: '3px 12px', borderRadius: '10px', backgroundColor: '#f30000', color: '#fff' }}>已驳回</div>)
    }
    else {
      return (<div style={{ padding: '3px 12px', borderRadius: '10px', border: '#ccc 1px solid' }}>{status}</div>)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>图形近似查询条件</CardTitle>
        <CardDescription style={{ marginTop: '20px' }}>
          商标审查标准（2019版）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red' }}>*</span>
            <span style={{ color: '#637381' }}>国际分类</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-wrap justify-start gap-4 items-start">
            {clsData.map((clsItem, index) => (
              <li
                style={{
                  listStyle: 'none',
                  fontSize: '12px',
                  color: cls === clsItem.cls ? '#fff' : 'rgb(102, 102, 102)',
                  cursor: 'pointer',
                  borderRadius: cls === clsItem.cls ? '10px' : '0px',
                  backgroundColor: cls === clsItem.cls ? '#fa9d3b' : '',
                  padding: '4px 10px',
                }}
                onClick={() => { useTrademarkCheck.setState({ cls: clsItem.cls }) }} key={index}>
                {clsItem.name}
              </li>
            ))}
          </div>
        </div>
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red' }}>*</span>
            <span style={{ color: '#637381' }}>商标图片</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap justify-between gap-4 items-start">
            {imageBase64 && (<img src={imageBase64} width={80} height={80} alt="Uploaded Logo" />)}
            <Button size="sm" className="h-8 gap-1" onClick={() => fileInputRef.current?.click()}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                图片上传
              </span>
            </Button>

            <span style={{ color: '#637381' }}>支持上传格式 png jpg gif svg</span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
          </div>
        </div>

        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">

          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap justify-between gap-4 items-start">
            {!loading && (<Button size="sm" className="h-8 gap-1 my-6" onClick={submitCheck}>
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                开始查询
              </span>
            </Button>)}
            {loading && (
              <LoadingSvg />
            )}
          </div>
        </div>
        <div style={{ gap: '30px', marginTop: '60px' }} className="w-full flex flex-row justify-start items-center flex-wrap">
          {currentData.map((product: any, index: number) => (
            <div key={index} style={{ border: '#ccc 1px solid', borderRadius: '10px', marginBottom: '12px' }} className='p-4 gap-4 flex flex-col items-center justify-center gap-2'>
              <img src={'https://gptserver.aliensoft.com.cn' + product.url} style={{ width: '240px', height: '120px' }} />
              <div className='p-4 gap-4 flex items-center justify-between gap-2'>
                <span>{getClsName(product?.cls)}</span>
                <span>{getTag(product?.status)}</span>
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
