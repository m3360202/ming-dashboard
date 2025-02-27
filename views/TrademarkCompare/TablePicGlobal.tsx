'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsData } from '@/utils/trademarkCls';
import { useTrademarkCheck } from '@/store/trademarkPicQDS';
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
  cls: string[];
  st: string;
  keyword: string;
  sc: string;
}

export function ItemsTablePicGlobal() {
  let router = useRouter();
  const { cls, st, keyword, sc }: TrademarkCheckState = useTrademarkCheck();
  let productsPerPage = 20;
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageTotal, setPageTotal] = useState<number>(0);
  const [showTestLogo, setShowTestLogo] = useState<boolean>(false);
  const [items, setItems] = useState<TrademarkItem[]>([]);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      useTrademarkCheck.setState({ cls: [] });
    } else {
      const allCls = clsData.map(clsItem => clsItem.cls);
      useTrademarkCheck.setState({ cls: allCls });
    }
    setSelectAll(!selectAll);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      const base64Data = base64.split('base64,')[1];
      setImageBase64(base64Data);
      setImage(base64);
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
      cls: cls.length > 1 ? cls.join(',') : cls[0],
      img_src: imageBase64
    };

    const headers = {

    }

    setShowTestLogo(true);
    // const url = 'http://localhost:8080/handleGetGlobalPicList';
    const url = 'https://gptserver.aliensoft.com.cn/handleGetGlobalPicList';
    axios.post(url, data, {
      headers: headers
    }).then((res) => {
      setLoading(false);

      if (res?.data?.data) {

        setData(res?.data?.data?.item);
        setPageTotal(res?.data?.data?.total);
      } else {
        alert('request fail');
      }

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

  return (
    <Card>
      <CardContent>
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red', marginRight: '5px' }}>*</span>
            <span style={{ color: '#637381' }}>国际分类</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-wrap justify-start gap-4 items-start">
            {clsData.map((clsItem, index) => (
              <li
                style={{
                  listStyle: 'none',
                  fontSize: '12px',
                  color: cls.indexOf(clsItem?.cls) > -1 ? '#fff' : 'rgb(102, 102, 102)',
                  cursor: 'pointer',
                  borderRadius: cls.indexOf(clsItem?.cls) > -1 ? '10px' : '0px',
                  backgroundColor: cls.indexOf(clsItem?.cls) > -1 ? '#fa9d3b' : '',
                  padding: '4px 10px',
                }}
                onClick={() => {
                  useTrademarkCheck.setState((state: any) => {
                    const { cls } = state;
                    const index = cls.indexOf(clsItem.cls);

                    if (index === -1) {
                      // 如果元素不在数组中，添加它
                      return { cls: [...cls, clsItem.cls] };
                    } else {
                      // 如果元素在数组中，移除它
                      return { cls: [...cls.slice(0, index), ...cls.slice(index + 1)] };
                    }
                  });
                }} key={index}>
                {clsItem.name}
              </li>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: '250px', color: '#637381', fontSize: '14px' }} className='flex flex-row items-center gap-2'>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
          />
          全选 / 取消全选
        </div>
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red', marginRight: '5px' }}>*</span>
            <span style={{ color: '#637381' }}>商标图片</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap justify-between gap-4 items-start">
            {image && (<img src={image} width={80} height={80} alt="Uploaded Logo" />)}
            <div className="flex flex-row items-center gap-4">
              <Button size="sm" className="h-8 gap-1" onClick={() => fileInputRef.current?.click()}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  图片上传
                </span>
              </Button>
              <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap justify-between gap-4 items-start ">
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

            <span style={{ color: '#637381' }}>支持上传格式 png jpg 商标审查标准（2021版），实时数据学习： 6-48小时迭代</span>
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

        <div style={{ gap: '30px', marginTop: '60px' }} className="w-full flex flex-row justify-start items-center flex-wrap">
          {currentData.map((product: any, index: number) => (
            <div key={index} style={{ border: '#ccc 1px solid', borderRadius: '10px', marginBottom: '12px' }} className='p-4 gap-2 flex flex-col items-center justify-start gap-2'>
              <div style={{ width: '200px', height: '200px' }} className="flex justify-center items-center overflow-hidden">
                <img
                  src={product.tmImage}
                  alt="Product Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className='w-full gap-4 flex items-center justify-between gap-2'>
                <span className="text-[12px] font-[800]">{product?.tmName}</span>
              </div>
              <div className='w-full gap-4 flex items-center justify-between gap-2'>
                <span style={{fontSize: '12px', color: '#637381', fontWeight: '600'}}>类目：{product?.regNo}</span>
                <span>{getTag(product?.tmStatus)}</span>
                <span style={{fontSize: '12px', color: '#637381', fontWeight: '400'}}>{product?.tmId}</span>
              </div>
              <div className='w-full gap-4 flex items-center justify-between gap-2'>
                <span style={{fontSize: '12px', color: '#637381', fontWeight: '400'}}>{product?.applicant}</span>
              </div>
              <div className='w-full gap-4 flex items-center justify-start gap-2'>
                <img style={{ width: '30px', height: '20px'}} src={'https://tm-files.oss-cn-beijing.aliyuncs.com/'+ product?.nationalFlag}/>
                <span style={{fontSize: '12px', color: '#637381', fontWeight: '400'}}>{product?.countryName}</span>
                <span style={{fontSize: '12px', color: '#637381', fontWeight: '400'}}>{product?.nationalName}</span>
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
            中 <strong>{data.length}</strong> 枚商标
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
