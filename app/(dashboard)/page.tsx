'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Suspense, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import { LoadingSvg } from '@/images/loading';
import { useUser } from '@/store/nav';
import axios from 'axios';

interface TrademarkItem {
  contactAddress?: any;
  rejectDate?: string;
  createTime?: string;
  appDate?: string;
  add_time: string;
  applicantCn: string;
  logoUrl: string;
  tmName: string;
  statusName: string;
  acceptDate: string;
  rescindDate: string;
  agent: string;
  intCls: string;
  regNo: string;
  operName: string;
  addressCn: string;
  contactPhone: string;
  contactEmail: string;
  clueWithCustomerVo: {
    fcontactPhone: string;
    fcontactEmail: string;
  };
}

export default function CustomersPage() {
  const { username } = useUser();
  const [loadingStates, setLoadingStates] = useState<boolean[]>(new Array(10).fill(false));
  const [dataStates, setDataStates] = useState<TrademarkItem[][]>(new Array(10).fill([]));
  const [dateList, setDateList] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Button configurations based on the three table components
  const buttonConfigs = [
    { id: 7, name: '驳回复审', api: 'loadData7', color: '#f30000', description: '经过AI比对，正在驳回的快照，的潜在用户将会被列出在这里' },
    { id: 8, name: '无效答辩', api: 'loadData8', color: '#fa9d3b', description: '经过AI比对，无效答辩风险大于60分，的潜在用户将会被列出在这里' },
    { id: 9, name: '撤三答辩', api: 'loadData9', color: '#6f67f0', description: '经过AI比对，撤三答辩风险大于60分，的潜在用户将会被列出在这里' },
    { id: 10, name: '撤三风险', api: 'loadData7', color: '#1485ee', description: '经过AI比对分析的撤三风险数据' },
    { id: 11, name: '驳回风险', api: 'loadData8', color: '#ffc300', description: '经过AI比对分析的驳回风险数据' },
    { id: 12, name: '等待注册', api: 'loadData9', color: '#07c160', description: '等待注册的商标数据' },
    { id: 13, name: '等待异议', api: 'loadData7', color: '#fa9d3b', description: '等待异议的商标数据' },
    { id: 14, name: '等待答辩', api: 'loadData8', color: '#f30000', description: '等待答辩的商标数据' },
    { id: 15, name: '等待续展', api: 'loadData9', color: '#6f67f0', description: '等待续展的商标数据' },
    { id: 16, name: '等待变更', api: 'loadData7', color: '#1485ee', description: '等待变更的商标数据' }
  ];

  // Date functions from the original components
  function calculateDaysOrApply(startDateString: string, type: string = 'default'): string {
    const startDate = new Date(startDateString);
    const currentDate = new Date();
    if (startDate > currentDate) {
      switch(type) {
        case 'reject':
          return "驳回发文";
        case 'accept':
          return "申请收文";
        default:
          return "待处理";
      }
    } else {
      const diffTime = currentDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      switch(type) {
        case 'reject':
          return `${diffDays} 天前 | 驳回发文`;
        case 'accept':
          return `${diffDays}天前 | 申请收文`;
        default:
          return `${diffDays}天前`;
      }
    }
  }

  const getDateList = async () => {
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/dataList', {});
      if (res?.data?.success) {
        setDateList(res?.data?.data);
        setStartDate(res?.data?.data[0].item);
        setEndDate(res?.data?.data[0].item);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const loadData = async (buttonIndex: number, config: any) => {
    if (!startDate || !endDate) return;
    
    setLoadingStates(prev => {
      const newStates = [...prev];
      newStates[buttonIndex] = true;
      return newStates;
    });

    try {
      const res = await axios.post(`https://ai.aliensoft.com.cn/api/${config.api}`, {
        startDate,
        endDate
      });

      if (res?.data?.success) {
        setDataStates(prev => {
          const newStates = [...prev];
          newStates[buttonIndex] = res?.data?.data || [];
          return newStates;
        });
      } else {
        alert('请求失败');
      }
    } catch (error) {
      console.log('error', error);
      alert('请求失败');
    } finally {
      setLoadingStates(prev => {
        const newStates = [...prev];
        newStates[buttonIndex] = false;
        return newStates;
      });
    }
  };

  const exportToCSV = async (buttonIndex: number, config: any) => {
    const data = dataStates[buttonIndex];
    if (!data || data.length === 0) {
      alert('没有数据可导出');
      return;
    }

    await axios.post('https://ai.aliensoft.com.cn/api/saveRecord', {
      username,
      item: config.id
    });

    const headers = [
      '申请人',
      '联系人', 
      '联系电话',
      '联系邮箱',
      '商标名称',
      '类目',
      '注册号',
      '状态',
      '申请日期',
      '代理机构'
    ];

    const escapeCommas = (field: string) => {
      if (field && field.includes(',')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const csvData = [
      headers.join(','),
      ...data.map(product => [
        product.applicantCn,
        product.operName,
        escapeCommas(product.contactPhone),
        escapeCommas(product.contactEmail),
        product.tmName,
        product.intCls,
        product.regNo,
        product.statusName,
        product.acceptDate,
        product.agent
      ].join(','))
    ].join('\r\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const fileName = `${startDate} ${config.name}潜在客户数据.csv`;
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    getDateList();
  }, []);

  return (
    <Suspense fallback={<p>Loading feed...</p>}>
      <Card>
        <CardHeader>
          <CardTitle>潜在客户探测</CardTitle>
          <CardDescription style={{marginTop: '20px'}}>获取最新国家知识产权局数据库的快照，有4-24小时延迟，领先于大部分国内数据商.AI探测可能性随时间积累和学习能力加强越来越有效率，现在平均出结果时间需要一周左右</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Selection Controls */}
          <div className="flex flex-row gap-4 items-center mb-6">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setEndDate(e.target.value);
              }}
              max="2025-04-01"
              style={{ padding: '8px 10px', border: '#ccc 1px solid', borderRadius: '8px' }}
            />
            <select
              onChange={(e) => {
                setStartDate(e.target.value);
                setEndDate(e.target.value);
              }}
              style={{ border: '#ccc 1px solid', padding: '10px 5px', borderRadius: '8px' }}>
              {dateList.map((item, index) => (
                <option key={index} value={item.item}>{item.item} {index === 0 ? '最近更新' : ''}</option>
              ))}
            </select>
          </div>

          {/* Loading Buttons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {buttonConfigs.map((config, index) => (
              <div key={config.id} className="flex flex-col gap-2">
                <Button
                  onClick={() => loadData(index, config)}
                  disabled={loadingStates[index]}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center"
                  style={{ borderColor: config.color, color: config.color }}
                >
                  {loadingStates[index] ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-4">
                        <LoadingSvg />
                      </div>
                      <span className="text-xs">加载中...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold">{config.name}</span>
                      <span className="text-xs">{dataStates[index]?.length || 0} 条数据</span>
                    </div>
                  )}
                </Button>
                {dataStates[index]?.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportToCSV(index, config)}
                    className="h-6 text-xs"
                  >
                    <File className="h-3 w-3 mr-1" />
                    导出
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Data Display */}
          {dataStates.map((data, buttonIndex) => 
            data.length > 0 && (
              <Card key={buttonIndex} className="mb-6">
                <CardHeader>
                  <div className="flex flex-row justify-between items-center">
                    <div>
                      <CardTitle style={{ color: buttonConfigs[buttonIndex].color }}>
                        {buttonConfigs[buttonIndex].name}
                      </CardTitle>
                      <CardDescription style={{ marginTop: '10px', fontSize: '14px', color: '#637381' }}>
                        {buttonConfigs[buttonIndex].description}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      共 {data.length} 条数据
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ gap: '30px', marginTop: '10px' }} className="w-full flex flex-col justify-start items-center flex-wrap">
                    {data.slice(0, 5).map((product, index) => (
                      <div key={index} style={{ border: '#ccc 1px solid', borderRadius: '10px', marginBottom: '12px' }} className='w-full p-4 gap-2 flex flex-row items-center justify-start gap-2'>
                        <div style={{ width: '100px', height: '100px', border: '#ccc 1px solid', borderRadius: '10px', padding: '8px' }} className="flex justify-center items-center overflow-hidden">
                          <img
                            src={product.logoUrl}
                            alt="Product Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className='flex flex-col ml-4'>
                          <div className='w-full gap-4 flex items-center justify-start gap-2'>
                            <span className="text-[14px] font-[800]">{product.tmName}</span>
                            <span style={{ color: '#fa9d3b' }} className="text-[14px] font-[800]">{product.statusName}</span>
                            <span style={{ color: '#f30000', backgroundColor: '#FFF0F5', borderRadius: '6px' }} className="text-[14px] px-4 py-1">
                              {calculateDaysOrApply(
                                product.acceptDate || product.rejectDate || product.appDate || '', 
                                buttonIndex === 0 ? 'reject' : 'accept'
                              )}
                            </span>
                            <span style={{ color: '#fa9d3' }} className="text-[14px] font-[800]">申请人：{product?.applicantCn}</span>
                            <span style={{ color: '#6f67f0' }} className="text-[14px] font-[800]">代理机构：{product.agent}</span>
                          </div>
                          <div className='w-full mt-2 gap-4 flex items-center justify-start gap-2'>
                            <span style={{ color: '#1485ee' }} className="text-[14px] font-[800]">类目：{product.intCls}</span>
                            <span style={{ color: '#ccc' }} className="text-[14px] font-[800]"> | </span>
                            <span style={{ color: '#ffc300' }} className="text-[14px] font-[800] ">注册号：{product.regNo}</span>
                          </div>
                          <div className='w-full mt-2 gap-4 flex items-center justify-start gap-2'>
                            <span style={{ color: '#1c252e' }} className="text-[14px] font-[800]">联系人：{product.operName}</span>
                            <span style={{ color: '#ccc' }} className="text-[14px] font-[800]"> | </span>
                            <span style={{ color: '#1c252e' }} className="text-[14px] font-[800] ">申请地址: {product.addressCn}</span>
                          </div>
                          <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                            <span style={{ color: '#1c252e' }} className="text-[14px] font-[800] ">联系电话：{product.contactPhone}</span>
                          </div>
                          <div className='w-full mt-2 gap-4 flex items-center justify-between gap-2'>
                            <span style={{ color: '#1c252e' }} className="text-[14px] font-[800] ">联系邮箱：{product.contactEmail}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground">
                        还有 {data.length - 5} 条数据，请导出查看完整数据
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </CardContent>
      </Card>
    </Suspense>
  );
}
