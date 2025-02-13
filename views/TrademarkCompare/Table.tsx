'use client';
import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ItemDetail } from './Item';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsData } from '@/utils/trademarkCls';
import { useTrademarkCheck } from '@/store/trademarkmutil';
import { PlusCircle } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';

export function ItemsTable() {
  let router = useRouter();
  const { cls, st, keyword } = useTrademarkCheck();
  let productsPerPage = 5;
  const [pageIndex, setPageIndex] = useState(1);
  const [pageTotal, setPageTotal] = useState(10);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const LoadingSvg = () => (
    <svg width="50" height="50" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <circle className="spin" cx="400" cy="400" fill="none"
        r="200" strokeWidth="60" stroke="#1485ee"
        strokeDasharray="800 1400"
        strokeLinecap="round"
      />
    </svg>
  )

  const submitCheck = async() => {
    if(!cls || cls.length === 0){
      return alert('请选择国际分类');
    }
    if(!keyword){
      return alert('请填写关键词');
    }

    const getTotal = (keyword: string) => {
      const r = keyword.replace('，',",");
      const result = r.split(',');
      return result.length;
    }
    const data = {
      keywords: keyword.replace('，',","),
      total: getTotal(keyword),
      cls: cls.join(',')
    }

    const headers = {

    }
    setLoading(true);
    // const url = 'https://gptserver.aliensoft.com.cn';
    const url = 'http://localhost:8080';
    axios.post(url + '/handleGetQDSTrademarkMutilList', data, {
      headers: headers
    }).then((res)=>{
      console.log('aaaaaaa',res?.data?.data?.data?.data)
      setLoading(false);
      setItems(res?.data?.data?.data?.data);
    }).catch((error)=>{
      console.log('error', error);
      setLoading(false);
      alert('request fail');
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>批量近似查询条件</CardTitle>
        <CardDescription style={{ marginTop: '20px' }}>
          商标审查标准（2025版）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red' }}>*</span>
            <span style={{ color: '#637381' }}>国际分类</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-wrap jusify-between gap-4 items-start">
            {clsData.map((clsItem: any, index: number) => (
              <li
                style={{ 
                  listStyle: 'none', 
                  color: cls.indexOf(clsItem?.cls) > -1 ? '#fff' : 'rgb(102, 102, 102)', 
                  cursor: 'pointer',
                  borderRadius: cls.indexOf(clsItem?.cls) > -1 ? '10px' : '0px',
                  backgroundColor: cls.indexOf(clsItem?.cls) > -1 ? 'rgb(29, 147, 171)' : '',
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
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red' }}>*</span>
            <span style={{ color: '#637381' }}>商标内关键词</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap jusify-between gap-4 items-start">
            <input onChange={(e)=>{
              useTrademarkCheck.setState({keyword: e.target.value});
            }} style={{border: '#1c252e 1px solid', width: '450px', borderRadius: '5px', padding: '6px'}} defaultValue={keyword} placeholder='请输入关键词，使用半角逗号,隔开' />
            <span style={{color: '#637381'}}>请输入关键词的 中/英文 字符/字母 或 数字,使用半角逗号,隔开</span>
          </div>
        </div>

        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">

          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap jusify-between gap-4 items-start">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] sm:table-cell">
                <span className="sr-only">查询结果</span>
              </TableHead>
              <TableHead>商标图片</TableHead>
              <TableHead>相似度</TableHead>
              <TableHead className="hidden md:table-cell">分类编号</TableHead>
              <TableHead className="hidden md:table-cell">注册号</TableHead>
              <TableHead className="hidden md:table-cell">当前状态</TableHead>
              <TableHead className="hidden md:table-cell">
                申请人
              </TableHead>
              <TableHead className="hidden md:table-cell">申请日期</TableHead>
              <TableHead>
                <span className="sr-only">操作</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((product, index) => (
              <ItemDetail key={index} product={product} index={index} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            {/* <strong>
              {Math.max(0, Math.min(offset - productsPerPage, pageTotal) + 1)}-{offset}
            </strong>{' '} */}
            of <strong>{pageTotal}</strong> products
          </div>
          <div className="flex">
            <Button
              // formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              // disabled={offset === productsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              // formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              // disabled={offset + productsPerPage > totalProducts}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
