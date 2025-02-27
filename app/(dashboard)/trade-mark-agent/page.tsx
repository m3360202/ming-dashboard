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
import { ItemsTable7 } from '@/views/TrademarkDetective/Table7';
import { ItemsTable8 } from '@/views/TrademarkDetective/Table8';
import { ItemsTable8freshAddress } from '@/views/TrademarkDetective/Table8freshAddress';
import { ItemsTable9 } from '@/views/TrademarkDetective/Table9';
import { ItemsTableLoading } from '@/views/TrademarkDetective/TableLoading';
import { ItemsTable } from '@/views/TrademarkDetective/Table';

export default function CustomersPage() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>潜在客户探测</CardTitle>
        <CardDescription style={{marginTop: '20px'}}>获取最新国家知识产权局数据库的快照，有4-24小时延迟，领先于大部分国内数据商.AI探测可能性随时间积累和学习能力加强越来越有效率，现在平均出结果时间需要一周左右</CardDescription>
      </CardHeader>
      <CardContent>
      <Tabs defaultValue="8">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="8">无效答辩</TabsTrigger>
          <TabsTrigger value="9">撤三答辩</TabsTrigger>
          <TabsTrigger value="7">驳回复审</TabsTrigger>
          <TabsTrigger value="10">撤三风险</TabsTrigger>
          <TabsTrigger value="3">驳回风险</TabsTrigger>
          <TabsTrigger value="1">等待注册</TabsTrigger>
          <TabsTrigger value="4">等待异议</TabsTrigger>
          <TabsTrigger value="5">等待答辩</TabsTrigger>
          <TabsTrigger value="6">等待续展</TabsTrigger>
          <TabsTrigger value="2">等待变更</TabsTrigger>
        </TabsList>
        <div className=" lg:hidden ml-auto flex items-center gap-2">
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
      <TabsContent value="8">
        <ItemsTable8 />
      </TabsContent>
      <TabsContent value="9">
      <ItemsTable9 />
      </TabsContent>
      <TabsContent value="7">
      <ItemsTable7 />
      </TabsContent>
      <TabsContent value="10">
      <ItemsTable />
      </TabsContent>
      <TabsContent value="1">
      <ItemsTableLoading />
      </TabsContent>
      <TabsContent value="2">
      <ItemsTableLoading />
      </TabsContent>
      <TabsContent value="3">
      <ItemsTableLoading />
      </TabsContent>
      <TabsContent value="4">
      <ItemsTableLoading />
      </TabsContent>
      <TabsContent value="5">
      <ItemsTableLoading />
      </TabsContent>
      <TabsContent value="6">
      <ItemsTableLoading />
      </TabsContent>
    </Tabs>

      </CardContent>
    </Card>
  );
}
