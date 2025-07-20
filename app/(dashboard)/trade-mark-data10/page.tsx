'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import { textMark } from '@/utils/origin';

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
      const res = await axios.post('http://localhost:8080/handleGetBHList', {
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
        // alert('请求失败');
      }
    } catch (error) {
      console.log('error', error);
      // alert('请求失败');
    }
  };

  useEffect(() => {
    // getData(pageStart);
  }, []);

  const writeToDBSingle = async () => {
    const data = textMark;
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/saveData7', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('------', res?.data);
      if (res?.data?.success === true) {
        console.log(`已写入第 ${pageStart + 1} 页数据`);

        
      } else {
        // alert('请求失败');
        setIsWriting(false);
      }
    } catch (error) {
      console.log('error', error);
      // alert('请求失败');
      setIsWriting(false);
    }
  };

  const writeToDB = async (dataList: any) => {
    try {
      const data= {dataList: dataList, add_time: '2025-07-21'}
      const res = await axios.post('https://ai.aliensoft.com.cn/api/saveData7', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('------', res?.data);
      if (res?.data?.success === true) {
        console.log(`已写入第 ${pageStart + 1} 页数据`);

        
      } else {
        // alert('请求失败');
        setIsWriting(false);
      }
    } catch (error) {
      console.log('error', error);
      // alert('请求失败');
      setIsWriting(false);
    }
  };
  let aaa: any;
  const startWrite = async() => {
    let pageStart = 1;
    // return console.log('------------',pages,pageStart + 1)
    aaa = setInterval(async() => {
      if (pageStart <= 20) {
      getData(pageStart).then((res) => {
        console.log('res',res)
        writeToDB(res); // 在获取数据后继续写入下一页
        pageStart = pageStart + 1;
      });
      
    }else{
      clearInterval(aaa);
      console.log('所有数据已写入完毕');
    }
    }, 35000);
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
        </div>
      </CardHeader>
    </Card>
  );
}
