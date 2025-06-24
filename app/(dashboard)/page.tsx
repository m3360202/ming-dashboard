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
import { LoadingSvg } from '@/images/loading';
import { useUser } from '@/store/nav';
import { 
  TrademarkItem, 
  buttonConfigs 
} from '@/utils/trademarkUtils';
import axios from 'axios';
import { exportToCSV, loadData } from '@/utils/exportCvs';

export default function CustomersPage() {
  const { username } = useUser();
  const [dataStates, setDataStates] = useState<TrademarkItem[][]>(new Array(10).fill([]));
  const [dateList, setDateList] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  
  const getDateList = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/dataList', {

      });

      if (res?.data?.success) {
        setDateList(res?.data?.data);
        console.log('---------datelist', res?.data?.data)
        setContent(res?.data?.data[0].content)
        setStartDate(res?.data?.data[0].item)
        setEndDate(res?.data?.data[0].item)
      } else {
        alert('请求失败');
      }
    } catch (error) {
      console.log('error', error);
      alert('请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载数据的函数
  const loadAllData = async (start: string, end: string) => {
    setLoading(true);
    try {
      const result = await loadData(start, end);
      if (result.success) {
        const newDataStates = new Array(10).fill([]);
        newDataStates[0] = result.data7 || [];
        newDataStates[1] = result.data8 || [];
        newDataStates[2] = result.data9 || [];
        setDataStates(newDataStates);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const generateDates = () => {
      const startDate = new Date('2025-02-20');
      const currentDate = new Date();
      const datesArray = [];
      while (startDate <= currentDate) {
        datesArray.push(startDate.toISOString().split('T')[0]);
        startDate.setDate(startDate.getDate() + 1);
      }
    };
    generateDates();
    getDateList();
  }, []);

  useEffect(() => {
    if(dateList.length > 0) {
      setStartDate(dateList[0].item);
      setEndDate(dateList[0].item);
    }
  }, [dateList]);

  useEffect(() => {
    if(startDate && endDate) {
      loadAllData(startDate, endDate);
    }
  }, [startDate, endDate]);

  return (
    <Suspense fallback={<p>Loading feed...</p>}>
    <Card>
      <CardHeader>
        <CardTitle>潜在客户探测</CardTitle>
        <CardDescription style={{marginTop: '20px'}}>获取最新国家知识产权局数据库的快照，撤三数据每周一周三更新，驳回数据每周一，周五更新</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Date Selection Controls */}
        <div className="flex flex-row gap-4 items-center mb-6">
          <span>2025-4-11 前数据</span>
          <input
            type="date"
            value={startDate}
            max="2025-04-11"
            disabled={loading}
            onChange={(e) => {
              setStartDate(e.target.value);
              setEndDate(e.target.value);
            }}
            style={{ 
              padding: '8px 10px', 
              border: '#ccc 1px solid', 
              borderRadius: '8px',
              opacity: loading ? 0.6 : 1
            }}
          />
          <span>2025-4-11 后数据</span>
          <select
            disabled={loading}
            onChange={(e) => {
              const selectedIndex = parseInt(e.target.value);
              const selectedItem = dateList[selectedIndex];
              setStartDate(selectedItem.item);
              setEndDate(selectedItem.item);
              setContent(selectedItem.content);
            }}
            style={{ 
              border: '#ccc 1px solid', 
              padding: '10px 5px', 
              borderRadius: '8px',
              opacity: loading ? 0.6 : 1
            }}>
            {dateList.map((item, index) => (
              <option key={index} value={index}>{item.item} {index === 0 ? '最近更新' : ''}</option>
            ))}
          </select>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4">
                <LoadingSvg />
              </div>
              <span>加载中...</span>
            </div>
          )}
          
        </div>
        {content && (
            <div className="w-full flex items-center gap-2 text-gray-600 mb-4">
              <span>{content}</span>
            </div>
          )}
        {/* Loading Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {buttonConfigs.map((config, index) => (
            <div key={config.id} className="flex flex-col gap-2">
              <Button
                onClick={() => exportToCSV(String(username), config, dataStates[index] as any)}
                disabled={loading}
                variant="outline"
                className="h-16 flex flex-col items-center justify-center"
                style={{ 
                  borderColor: config.color, 
                  color: config.color,
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4">
                      <LoadingSvg />
                    </div>
                    <span className="text-xs">
                      {loading ? '数据加载中...' : '导出中...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold">{config.name}</span>
                    {config.id < 10 ? (
                      <span className="text-xs">{dataStates[index]?.length || 0} 条数据</span>
                      ) : (
                        <span className="text-xs">开发中</span>
                      )}
                  </div>
                )}
              </Button>
              
            </div>
          ))}
        </div>

        {/* Data Display */}
        {/* {dataStates.map((data, buttonIndex) => 
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
                              product.acceptDate || product.rejectDate || product.appDate || product.rescindDate || '', 
                              buttonConfigs[buttonIndex].dateType
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
        )} */}

      </CardContent>
    </Card>
    </Suspense>
  );
}
