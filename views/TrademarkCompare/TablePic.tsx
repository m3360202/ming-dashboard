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
import { useTrademarkCheck } from '@/store/trademarkPic';
import { PlusCircle } from 'lucide-react';
import { uploadFile } from "@/utils/upload";
import { useCurrentFile } from "@/store/upload";
import axios from 'axios';
import { useState } from 'react';
import TestLogo from '@/images/testlogo.jpg';

export function ItemsTablePic() {
  let router = useRouter();
  const { cls, st, keyword, sc } = useTrademarkCheck();
  let productsPerPage = 5;
  const [pageIndex, setPageIndex] = useState(1);
  const [pageTotal, setPageTotal] = useState(10);
  const [showTestLogo, setShowTestLogo] = useState(false);
  const [items, setItems] = useState([]);

  // function prevPage() {
  //   router.back();
  // }

  // function nextPage() {
  //   router.push(`/?offset=${offset}`, { scroll: false });
  // }

  const submitCheck = async() => {
    if(!cls){
      return alert('请选择国际分类');
    }
    if(!st){
      return alert('请选择商标匹配语言库');
    }
    if(!keyword){
      return alert('请填写特征词');
    }
    const payload = {
      keyword,
      pageIndex,
      cls,
      st,
      sc
    }
    setShowTestLogo(true);
    axios.get('https://gptserver.aliensoft.com.cn/handleGetTrademarkList',{
      params: payload
    }).then((res)=>{
      console.log('aaaaaaa',res)
      setItems(res?.data?.data);
      setPageTotal(res?.data?.pager?.total)
    }).catch((error)=>{
      console.log('error', error);
      alert('request fail');
    })
  }

  // const handleSetImg = async(file: any) => {
  //   const currentFile = useCurrentFile.getState().file ?? { name: '' };
  //   if (currentFile.name.length > 0) {
  //     await uploadFile(currentFile);
  //   }
  //   const img = useCurrentFile.getState().url;
  //   if (file && file[0] && file[0].file) {
  //     useCurrentFile.setState({ file: file[0].file });
  //   }

  // }

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
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-wrap jusify-between gap-4 items-start">
            {clsData.map((clsItem, index) => (
              <li
                style={{ 
                  listStyle: 'none', 
                  color: cls === clsItem.cls ? '#fff' : 'rgb(102, 102, 102)', 
                  cursor: 'pointer',
                  borderRadius: cls === clsItem.cls ? '10px' : '0px',
                  backgroundColor: cls === clsItem.cls ? 'rgb(29, 147, 171)' : '',
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
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap jusify-between gap-4 items-start">
            {showTestLogo &&(<img src={TestLogo.src} width={80} height={80} />)}
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                图片上传
              </span>
            </Button>
            <span style={{color: '#637381'}}>支持上传格式 png jpg gif svg</span>
          </div>
        </div>

        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">

          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap jusify-between gap-4 items-start">
            <Button size="sm" className="h-8 gap-1 my-6" onClick={submitCheck}>
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                开始查询
              </span>
            </Button>
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
