'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { File, PlusCircle } from 'lucide-react';
import { ItemsTable } from '@/views/TrademarkCompare/Table';

export default function CustomersPage() {
  const results: any[] = [];
  const newOffset= 100;
  const totalProducts= 90;
  return (
    <Card>
      <CardHeader>
        <CardTitle>商标近似查询</CardTitle>
        <CardDescription style={{marginTop: '20px'}}>查询的匹配样本，采用中国，国际，欧盟的最新实时数据库进行数据检索，并通过Logo图形区域匹配算法，关键字相似度匹配进行AIGC数据校验，可能耗时较长.</CardDescription>
      </CardHeader>
      <CardContent>
      <Tabs defaultValue="china">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="china">国内商标</TabsTrigger>
          <TabsTrigger value="foreign">国际商标</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              导出数据
            </span>
          </Button>
          {/* <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button> */}
        </div>
      </div>
      <TabsContent value="china">
        <ItemsTable
          items={results}
          offset={newOffset ?? 0}
          totalProducts={totalProducts}
        />
      </TabsContent>
      <TabsContent value="foreign">
        <span style={{marginLeft: '10px',marginTop: '30px'}}>
              开发中，寻找数据源中...
            </span>
      </TabsContent>
    </Tabs>

      </CardContent>
    </Card>
  );
}
