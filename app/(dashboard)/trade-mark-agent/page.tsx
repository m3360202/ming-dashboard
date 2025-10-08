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
import '@/views/TrademarkDetective/style.css';

export default function CustomersPage() {
  const { username } = useUser();
  const [dataStates, setDataStates] = useState<TrademarkItem[][]>(new Array(10).fill([]));
  const [dataCounts, setDataCounts] = useState<number[]>([0, 0, 0]); // 数据数量
  const [dateList, setDateList] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCardId, setLoadingCardId] = useState<number | null>(null); // 当前加载的卡片ID
  const [content, setContent] = useState<string>('');

  const getDateList = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/dataList', {});

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

  // 获取数据数量
  const getDataCounts = async (start: string, end: string) => {
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/dataListCount', {
        startDate: start,
        endDate: end
      });

      console.log('数据数量请求结果:', res?.data);
      if (res?.data?.success) {
        const counts = res.data.total || [0, 0, 0];
        console.log('设置数据数量:', counts);
        setDataCounts(counts);
      }
    } catch (error) {
      console.log('获取数量失败:', error);
    }
  };

  // 加载单个卡片的数据
  const loadCardData = async (cardIndex: number, start: string, end: string) => {
    setLoadingCardId(cardIndex);
    try {
      // 根据卡片索引确定API端点
      let apiEndpoint = '';
      if (cardIndex === 0) apiEndpoint = 'https://ai.aliensoft.com.cn/api/loadData7';
      else if (cardIndex === 1) apiEndpoint = 'https://ai.aliensoft.com.cn/api/loadData8';
      else if (cardIndex === 2) apiEndpoint = 'https://ai.aliensoft.com.cn/api/loadData9';
      
      if (!apiEndpoint) {
        throw new Error('无效的卡片索引');
      }

      // 只请求对应卡片的数据
      const response = await axios.post(apiEndpoint, {
        startDate: start,
        endDate: end
      });

      if (response?.data?.success) {
        const cardData = response.data.data || [];
        
        // 更新状态
        const newDataStates = [...dataStates];
        newDataStates[cardIndex] = cardData;
        setDataStates(newDataStates);
        
        // 返回加载的数据
        return cardData;
      }
      return [];
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败');
      return [];
    } finally {
      setLoadingCardId(null);
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
    if (dateList.length > 0) {
      setStartDate(dateList[0].item);
      setEndDate(dateList[0].item);
    }
  }, [dateList]);

  useEffect(() => {
    if (startDate && endDate) {
      // 只获取数量，不加载具体数据
      getDataCounts(startDate, endDate);
    }
  }, [startDate, endDate]);

  return (
    <Suspense fallback={<p>Loading feed...</p>}>
      <Card>
        <CardHeader>
          <CardTitle>潜在客户探测</CardTitle>
          <CardDescription style={{ marginTop: '20px', color: '#fe4c24' }}>获取最新国家知识产权局数据库的快照，撤三数据每周一周三更新，驳回数据每周一，周五更新</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Selection Controls */}
          <div className="flex flex-row gap-4 items-center mb-6">
            <span style={{ color: '#26d', fontSize: '14px' }}>选择日期（全日期可选支持）</span>
            <input
              type="date"
              value={startDate}
              // max="2025-04-11"
              disabled={loading}
              onChange={(e) => {
                setStartDate(e.target.value);
                setEndDate(e.target.value);
                // 清空已加载的数据，重新获取数量
                setDataStates(new Array(10).fill([]));
              }}
              style={{
                padding: '3px 10px',
                border: '#ccc 1px solid',
                borderRadius: '8px',
                opacity: loading ? 0.6 : 1,
                fontSize: '14px'
              }}
            />
            <span style={{ color: '#26d', fontSize: '14px' }}></span>
            {/* <select
              disabled={loading}
              onChange={(e) => {
                const selectedIndex = parseInt(e.target.value);
                const selectedItem = dateList[selectedIndex];
                setStartDate(selectedItem.item);
                setEndDate(selectedItem.item);
                setContent(selectedItem.content);
                // 清空已加载的数据，重新获取数量
                setDataStates(new Array(10).fill([]));
              }}
              style={{
                border: '#ccc 1px solid',
                padding: '3px 10px',
                borderRadius: '8px',
                opacity: loading ? 0.6 : 1,
                fontSize: '14px'
              }}>
              {dateList.map((item, index) => (
                <option style={{ fontSize: '14px' }} key={index} value={index}>{item.item} {index === 0 ? '最近更新' : ''}</option>
              ))}
            </select> */}
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
          <div className="flex flex-wrap gap-4 mb-6">
            {buttonConfigs.map((config, index) => (
              <Card key={config.id} className="w-[220px] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white">
                <CardContent className="p-4">
                  <Button
                    onClick={async () => {
                      try {
                        // 检查是否已有数据
                        if (index < 3 && dataStates[index].length === 0) {
                          // 没有数据，先加载数据
                          const loadedData = await loadCardData(index, startDate, endDate);
                          if (loadedData && loadedData.length > 0) {
                            exportToCSV(String(username), config, loadedData as any);
                          } else {
                            alert('暂无数据可导出');
                          }
                        } else {
                          // 已有数据，直接导出
                          const currentData = dataStates[index];
                          if (currentData && currentData.length > 0) {
                            exportToCSV(String(username), config, currentData as any);
                          } else {
                            alert('暂无数据可导出');
                          }
                        }
                      } catch (error) {
                        console.error('操作失败:', error);
                        alert('操作失败，请重试');
                      }
                    }}
                    disabled={loading || loadingCardId === index}
                    variant="ghost"
                    className="w-full h-16 flex flex-col items-center justify-center p-0 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    style={{
                      opacity: (loading || loadingCardId === index) ? 0.6 : 1
                    }}
                  >
                    {loadingCardId === index ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-4 h-4">
                          <LoadingSvg />
                        </div>
                        <span className="text-xs">数据加载中...</span>
                      </div>
                    ) : (
                      <div className='w-full flex items-center justify-around'>
                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7974" width="36" height="36"><path d="M663.04 112.64h-430.08c-29.184 0-52.736 22.528-53.248 49.664v698.368c0 27.648 23.552 49.664 53.248 49.664h557.568c29.184 0 52.736-22.528 52.736-49.664V302.08l-180.224-189.44z" fill="#5393FB" p-id="7975"></path><path d="M663.03488 112.64v189.44h180.736l-180.736-189.44z" fill="#0850C6" p-id="7976"></path><path d="M338.18112 376.53504c0-12.8 9.728-23.04 22.016-23.04h301.568c12.288 0 22.016 10.24 22.016 23.04s-9.728 23.04-22.016 23.04h-301.568c-11.776 0.512-22.016-10.24-22.016-23.04zM394.50112 603.35104c-2.56 0-4.608 1.536-5.632 4.096-1.024 2.56-0.512 5.632 1.536 7.168l112.128 112.64c2.048 2.56 5.632 4.096 8.704 4.096 3.072 0 6.656-1.536 8.704-4.096l112.128-112.64c1.536-2.048 2.048-4.608 1.536-7.168-1.024-2.56-3.072-4.096-5.632-4.096h-66.048v-112.64c0-7.168-5.632-13.312-12.8-13.312h-75.776c-6.656 0-12.288 6.144-12.8 13.312v112.64h-66.048z" fill="#FFFFFF" ></path></svg>
                        <div className="flex flex-col items-left">
                          <div className="flex items-center gap-1 justify-between mb-2">
                            <span style={{ color: '#1c252e' }} className="font-bold text-[16px]  opacity-90">{config.name}</span>

                          </div>
                          <div className="flex items-center gap-1 justify-between">

                            {config.id < 10 ? (
                              <div className="flex items-center gap-1">
                                <span style={{ color: '#26d' }} className="text-[12px] opacity-90">点击下载</span>
                                <span style={{ color: '#26d' }} className="text-xs opacity-75">
                                  ({index < 3 ? dataCounts[index] || 0 : dataStates[index]?.length || 0} 条数据)
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#26d' }} className="text-xs opacity-75">开发中</span>
                            )}
                          </div>
                        </div>
                      </div>

                    )}
                  </Button>
                </CardContent>
              </Card>
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
