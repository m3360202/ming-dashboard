'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clsData } from '@/utils/trademarkCls';
import { useTrademarkCheck } from '@/store/trademarkmutil';
import axios from 'axios';
import { useState } from 'react';

export function ItemsTable() {
  const { cls, keyword } = useTrademarkCheck();
  const [items, setItems] = useState<any[]>([]);
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

  const submitCheck = async () => {
    setItems([]);
    if (!cls || cls.length === 0) {
      return alert('请选择国际分类');
    }
    if (!keyword) {
      return alert('请填写关键词');
    }

    const getTotal = (keyword: string) => {
      const r = keyword.replace('，', ",");
      const result = r.split(',');
      return result.length;
    }
    const data = {
      keywords: keyword.replace('，', ","),
      total: getTotal(keyword),
      cls: cls.join(',')
    }

    const headers = {

    }
    setLoading(true);
    const url = 'https://gptserver.aliensoft.com.cn';
    // const url = 'http://localhost:8080';
    axios.post(url + '/handleGetQDSTrademarkMutilList', data, {
      headers: headers
    }).then((res) => {
      if (res?.data?.data?.data?.data) {
        console.log('aaaaaaa', transformData(res?.data?.data?.data?.data))
        setLoading(false);
        setItems(transformData(res?.data?.data?.data?.data));
        return true;
      } else {
        setLoading(false);
        alert('request fail');
        return false;
      }
    }).catch((error) => {
      console.log('error', error);
      setLoading(false);
      alert('request fail');
    })
  }

  const getClsName = (cls: string) => {
    const result = clsData.filter(m => m.cls == cls);
    return result[0].name;
  }

  const getColorLevel = (item: string) => {
    if (item === '高风险') {
      return '#f30000';
    }
    if (item === '中风险') {
      return '#fa9d3b';
    }
    if (item === '低风险') {
      return '#07c160';
    }
  }

  const getColorGroup = (item: string) => {
    if (item === '高') {
      return '#f30000';
    }
    if (item === '中') {
      return '#fa9d3b';
    }
    if (item === '低') {
      return '#07c160';
    }
  }

  const getTagLevel = (item: string) => {
    if (item === '高风险') {
      return '通过率40%以下';
    }
    if (item === '中风险') {
      return '通过率50%左右';
    }
    if (item === '低风险') {
      return '#通过率70%以上';
    }
  }

  const convertObjectToArray = (obj: any) => {
    return Object.keys(obj).map((key) => ({
      name: key,
      value: obj[key],
    }));
  };

  const transformData = (sourceData: any) => {
    const result = [];

    for (const key in sourceData) {
      const group = sourceData[key];
      const groupData = [];

      for (const subKey in group) {
        const item = group[subKey];
        const transformedItem = {
          value: parseInt(subKey),
          data: {
            approximateList: item.approximateList,
            approximateTotal: item.approximateTotal,
            groupRisk: convertObjectToArray(item.groupRisk),
            riskLevel: item.riskLevel,
          },
        };
        groupData.push(transformedItem);
      }

      result.push({
        name: key,
        data: groupData,
      });
    }

    return result;
  };

  return (
    <Card>
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
                  fontSize: '12px',
                  color: cls.indexOf(clsItem?.cls) > -1 ? '#fff' : 'rgb(102, 102, 102)',
                  cursor: 'pointer',
                  borderRadius: cls.indexOf(clsItem?.cls) > -1 ? '10px' : '0px',
                  backgroundColor: cls.indexOf(clsItem?.cls) > -1 ? '#fa9d3b' : '',
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
            <input onChange={(e) => {
              useTrademarkCheck.setState({ keyword: e.target.value });
            }} style={{ border: '#1c252e 1px solid', width: '450px', borderRadius: '5px', padding: '6px' }} defaultValue={keyword} placeholder='请输入关键词，使用半角逗号,隔开' />
            <span style={{ color: '#637381' }}>请输入关键词的 中/英文 字符/字母 或 数字,使用半角逗号,隔开</span>
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
        <table style={{ border: '#ffe0b3 1px solid' }}>
          <tr>
            <td style={{ padding: '20px', width: '160px', textAlign: 'center', fontSize: '16px', color: '#666', fontWeight: '800' }}>检索词</td>
            <td style={{borderBottom: '1px solid #ffe0b3', width: '100%'}}>
              <table style={{width: '100%'}}>
                <tr>
                  <td style={{ padding: '20px', width: '180px', textAlign: 'center', fontSize: '16px', color: '#666', fontWeight: '800' }}>分类</td>
                  <td style={{ padding: '20px', width: '150px', textAlign: 'center', fontSize: '16px', color: '#666', fontWeight: '800' }}>风险评估</td>
                  {/* <td style={{ padding: '20px', width: '150px', textAlign: 'center' }}>相同或近似</td> */}
                  <td style={{ padding: '20px', width: '150px', textAlign: 'center', fontSize: '16px', color: '#666', fontWeight: '800' }}>群组风险</td>
                  <td style={{ padding: '20px', textAlign: 'center', fontSize: '16px', color: '#666', fontWeight: '800' }}>对比结果</td>
                </tr>
              </table>
            </td>
            
          </tr>
          {items.map((a: any, index1: number) => (
            <tr key={index1}>
              <td style={{ border: '1px solid #ffe0b3', padding: '20px 40px', color: '#333', fontSize: '14px', width: '160px', wordBreak: 'break-word' }}>{a.name}</td>
              <td>
                {a.data.map((b: any, index2: number) => (
                  <tr key={index2} style={{ borderBottom: '#ffe0b3 1px solid' }}>
                    <td style={{ padding: '20px', color: '#999', fontSize: '14px', width: '180px' }}>
                      {getClsName(b?.value)}
                    </td>
                    <td style={{ padding: '20px', width: '150px' }}>
                      <div className="flex flex-col items-center gap-4">
                        <span style={{ fontSize: '14px', color: getColorLevel(b.data.riskLevel) }}>{b.data.riskLevel}</span>
                        <span style={{ fontSize: '14px', color: '#999' }}>{getTagLevel(b.data.riskLevel)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ width: '200px' }} className="flex flex-row items-center gap-2 flex-wrap w-[200px]">
                        {b.data.groupRisk.map((c: any, index3: number) => (
                          <span key={index3} style={{ fontSize: '12px', color: getColorGroup(c.value) }}>{c.name}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div className="flex flex-row items-center gap-2 flex-wrap">
                        {b.data.approximateList.map((d: any, index4: number) => (
                          <span key={index4} style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>
                            {d.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </td>
            </tr>
          ))}
        </table>

      </CardContent>
    </Card>
  );
}
