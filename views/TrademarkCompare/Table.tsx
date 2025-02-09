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
import { useTrademarkCheck } from '@/store/trademark';
import { PlusCircle } from 'lucide-react';

export function ItemsTable({
  items,
  offset,
  totalProducts
}: {
  items: any[];
  offset: number;
  totalProducts: number;
}) {
  let router = useRouter();
  const { cls, st, keyword } = useTrademarkCheck();
  let productsPerPage = 5;

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>近似查询条件</CardTitle>
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
            <span style={{ color: '#637381' }}>查询方式</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-wrap jusify-between gap-4 items-start">
            <select
              defaultValue={st}
              style={{border: '#1c252e 1px solid', width: '150px', borderRadius: '5px', padding: '6px'}}
              onChange={(e)=>{
                useTrademarkCheck.setState({st: e.target.value});
                if(e.target.value === "1"){
                  useTrademarkCheck.setState({sc: "1,2,3,4,5,6,7,8,9,10"});
                }
                if(e.target.value === "4"){
                  useTrademarkCheck.setState({sc: "1,2,3,4,5,6,7,8,9,10,11"});
                }
              }}
            >
              <option value="1">
                中文
              </option>
              <option value="4">
                英文
              </option>
            </select>
          </div>
        </div>
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red' }}>*</span>
            <span style={{ color: '#637381' }}>商标内关键词</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap jusify-between gap-4 items-start">
            <input style={{border: '#1c252e 1px solid', width: '450px', borderRadius: '5px', padding: '6px'}} defaultValue={keyword} placeholder='请输入商标内可能存在的中/英文 字符/字母 或 数字' />
            <span style={{color: '#637381'}}>请输入商标内可能存在的中/英文 字符/字母 或 数字,这有助于从更精确的样本中选取对比数据,从而提高图片校验效率和准确性</span>
          </div>
        </div>
        <div className='flex flex-row justify-between w-full my-4'>
          <div className="w-[150px]">
            <span style={{ color: 'red' }}>*</span>
            <span style={{ color: '#637381' }}>商标图片</span>
          </div>
          <div style={{ width: '85%' }} className="max-w-[85%] flex flex-col flex-wrap jusify-between gap-4 items-start">
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                图片上传
              </span>
            </Button>
            <span style={{color: '#637381'}}>支持上传格式 png jpg gif svg</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
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
            {items.map((product) => (
              <ItemDetail key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.max(0, Math.min(offset - productsPerPage, totalProducts) + 1)}-{offset}
            </strong>{' '}
            of <strong>{totalProducts}</strong> products
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === productsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + productsPerPage > totalProducts}
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
