'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import { textMark } from '@/utils/origin';
import { getPhoneData } from '@/utils/index';

export default function ItemsTable() {
  const productsPerPage = 100;
  const [pageStart, setPageStart] = useState(0);
  const [pageTotal, setPageTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [data, setData] = useState([]);
  const [isWriting, setIsWriting] = useState(false);

  const getData = async (pageNo: any) => {
    if (isWriting) return; // 如果正在写入，则不获取新数据

    try {
      const res = await axios.post('http://localhost:8080/handleGetWUXIAOTargetList', {
        pageNo: pageNo,
        pageSize: productsPerPage
      });

      if (res?.data?.data) {
        console.log('------', res?.data?.data?.list);
        const result = res?.data?.data?.list;
        setData(result);
        setPageTotal(res?.data?.data?.total);
        setPages(res?.data?.data?.pages);
        return res?.data?.data?.list;
      } else {
        alert('请求失败');
      }
    } catch (error) {
      console.log('error', error);
      alert('请求失败');
    }
  };

  const writeToDBSingle = async () => {
    const data = textMark;
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/saveData8', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('------', res?.data);
      if (res?.data?.success === true) {
        console.log(`已写入第 ${pageStart + 1} 页数据`);

        
      } else {
        alert('请求失败');
        setIsWriting(false);
      }
    } catch (error) {
      console.log('error', error);
      alert('请求失败');
      setIsWriting(false);
    }
  };

  const writeToDB = async (dataList: any) => {
    try {
      const data= {dataList: dataList, add_time: '2025-07-05'}
      const res = await axios.post('https://ai.aliensoft.com.cn/api/saveData8', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('------', res?.data);
      if (res?.data?.success === true) {
        console.log(`已写入第 ${pageStart + 1} 页数据`);

        
      } else {
        alert('请求失败');
        setIsWriting(false);
      }
    } catch (error) {
      console.log('error', error);
      alert('请求失败');
      setIsWriting(false);
    }
  };
  let aaa: any;
  const startWrite = async() => {
    let pageStart = 1;
    // return console.log('------------',pages,pageStart + 1)
    
    // 添加延迟函数
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    while (pageStart <= 1) {
      try {
        const res = await getData(pageStart);
        console.log('res', res);
        
        // 使用 for...of 循环来确保每个请求之间有延迟
        for (const item of res) {
          await sleep(5000); // 等待5秒
          const phone = await getPhoneData(item.applicantCn);
          console.log('phone', phone);
          item.contactPhone = phone || item.contactPhone;
        }
        
        // writeToDB(res); // 在获取数据后继续写入下一页
        pageStart = pageStart + 1;
        
        // 外层延迟6秒
        if (pageStart <= 1) {
          await sleep(6000);
        }
      } catch (error) {
        console.error('处理数据时出错:', error);
        break;
      }
    }
    
    console.log('所有数据已写入完毕');
  }
  return (
    <Card>
      <CardHeader>
        <div className='flex flex-row justify-between items-center'>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={startWrite} disabled={isWriting}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {isWriting ? '正在导入...' : '导入数据到数据库'}
            </span>
          </Button>

          {/* <Button size="sm" variant="outline" className="h-8 gap-1" onClick={startUpdate} disabled={isWriting}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {isWriting ? '正在更新...' : '更新数据'}
            </span>
          </Button> */}
        </div>
      </CardHeader>
    </Card>
  );
}
