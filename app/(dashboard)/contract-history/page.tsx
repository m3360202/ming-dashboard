'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import axios from 'axios';
import { Input } from '@/components/ui/input';

export default function ContractHistoryPage() {

  const [data, setData] = useState<any[]>([]);
  const [pageStart, setPageStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState<string>(''); // 搜索的客户名称

  const getContract = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/listHistoryContract', {
        pageStart,
        pageSize: 20,
        customer: searchCustomer // 添加搜索的客户名称
      });

      if (res?.data?.data) {
        setData(res?.data?.data);
        setTotal(res?.data?.total);
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

  useEffect(() => {
    getContract();
  }, [pageStart, searchCustomer]);

  const handleNextPage = () => {
    setPageStart((prev) => prev + 20);
  };

  const handlePrevPage = () => {
    setPageStart((prev) => Math.max(prev - 20, 0));
  };

  const getStep = (step: number) => {
    const baseStyle = "w-[fit-content] px-4 py-1 rounded-full text-white text-xs font-semibold";

    switch (step) {
      case 0:
        return <div className={`${baseStyle} bg-[#FA5151]`}>待审核</div>;
      case 2:
        return <div className={`${baseStyle} bg-[#FA9D3B]`}>已盖章，待签约</div>;
      case 3:
        return <div className={`${baseStyle} bg-[#FFC300]`}>已签约，已支付</div>;
      case 1:
        return <div className={`${baseStyle} bg-[#91D300]`}>已驳回，待编辑</div>;
      case 4:
        return <div className={`${baseStyle} bg-[#10AEEF]`}>已归档</div>;
      default:
        return <div className={`${baseStyle} bg-[#6467F0]`}>未知状态</div>;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>合同模板列表</CardTitle>
        <CardDescription style={{ marginTop: '10px' }}>
          浏览并下载您企业下的签约合同模板。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 搜索框 */}
        <div className="w-full flex justify-end mb-4">
          <Input
            placeholder="请输入客户名称或合同编号搜索..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>

        {loading ? (
          <p>加载中...</p>
        ) : (
          <div className="space-y-4">
            {/* 表头 */}
            <div className="w-full grid grid-cols-9 gap-4 p-4 bg-gray-100 rounded-lg font-semibold">
              
              <div>合同编号</div>
              <div>客户名称</div>
              <div>合同类型</div>
              <div>业务状态</div>
              <div>审查日期</div>
              <div>签约日期</div>
              <div>实收金额</div>
              <div>税费</div>
              <div>查看附件</div>
            </div>

            {/* 数据行 */}
            {data.map((contract: any) => (
              <div key={contract.id} className="w-full grid grid-cols-9 gap-4 p-4 border rounded-lg">
                
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#FA9D3B' }}>{contract.contract_no}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#1485EE' }}>{contract.customer}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#FA9D3B' }}>{contract.contract_type}</div>
                <div style={{ fontWeight: '400', fontSize: '14px' }}>{getStep(contract.step)}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#6467F0' }}>{new Date(contract.confirm_time).toLocaleDateString('en-CA').split('/').join('-')}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#6467F0' }}>{contract.sign_time}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#FA9D3B' }}>￥{contract.contract_fee || 0}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#FA9D3B' }}>￥{contract.contract_tax}</div>
                <div
                  onClick={() => {
                    window.open('https://hypergpt.oss-ap-southeast-1.aliyuncs.com/' + contract.contract_origin, '_blank')
                  }}
                  style={{ fontWeight: '400', fontSize: '14px' }}
                  className="flex items-center cursor-pointer justify-start pl-4">
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                    <path d="M502.592 908.448H146.816V83.52h711.552v386.656c0 15.488 10.144 25.792 25.408 25.792 15.232 0 25.408-10.304 25.408-25.792V57.792c0-12.896-12.704-25.792-25.408-25.792H121.408C108.704 32 96 44.896 96 57.792v876.416c0 12.896 12.704 25.792 25.408 25.792h381.184c15.232 0 25.408-10.304 25.408-25.792 0-15.456-10.176-25.76-25.408-25.76z" fill="#555555" p-id="5358"></path><path d="M768 544c123.2 0 224 100.8 224 224s-100.8 224-224 224-224-100.8-224-224 100.8-224 224-224z m0 32c-105.6 0-192 86.4-192 192s86.4 192 192 192 192-86.4 192-192-86.4-192-192-192z" fill="#B50B14" p-id="5359"></path><path d="M756.704 418.656c0-12.864-12.704-25.76-25.408-25.76H273.888c-12.704 0-25.408 12.896-25.408 25.76 0 12.896 12.704 25.792 25.408 25.792h457.408c12.704 0 25.408-12.896 25.408-25.792z m-332.896 128.896H278.976c-15.264 0-27.968 10.304-27.968 25.792 0 12.864 12.704 25.76 27.968 25.76h144.832c15.264 0 27.968-12.896 27.968-25.76 0-15.488-12.704-25.792-27.968-25.792z m0 154.656H278.976c-15.264 0-27.968 10.336-27.968 25.792 0 12.896 12.704 25.792 27.968 25.792h144.832c15.264 0 27.968-12.896 27.968-25.792 0-15.456-12.704-25.792-27.968-25.792z m307.488-464H273.888c-12.704 0-25.408 12.896-25.408 25.792s12.704 25.792 25.408 25.792h457.408c12.704 0 25.408-12.896 25.408-25.792s-12.704-25.792-25.408-25.792z" fill="#999999" p-id="5360"></path><path d="M814.976 646.272l1.024 0.928 45.312 43.456a23.872 23.872 0 0 1 0.96 33.792l-0.96 0.992-132.224 126.784a26.144 26.144 0 0 1-16.64 7.168l-1.472 0.032H659.2a18.88 18.88 0 0 1-19.2-17.344L640 840.96v-49.6a24 24 0 0 1 6.528-16.384l0.96-1.024 132.256-126.784a26.432 26.432 0 0 1 35.232-0.928z m74.624 188.064c3.52 0 6.4 2.752 6.4 6.144v12.288c0 1.632-0.672 3.2-1.888 4.352a6.56 6.56 0 0 1-4.512 1.824h-102.592a6.56 6.56 0 0 1-4.512-1.824 6.016 6.016 0 0 1-1.888-4.352v-12.288c0-3.392 2.88-6.144 6.4-6.144H889.6z m-128-134.976l-95.968 92v43.456h45.344l95.968-92-45.344-43.456z m128 85.792c1.696 0 3.328 0.64 4.512 1.824a6.016 6.016 0 0 1 1.888 4.352v12.288c0 3.392-2.88 6.144-6.4 6.144h-51.296c-3.52 0-6.4-2.752-6.4-6.144v-12.288c0-1.632 0.64-3.2 1.856-4.352a6.56 6.56 0 0 1 4.544-1.824H889.6z m-91.744-120.576l-18.112 17.376 45.312 43.488 18.144-17.376-45.312-43.488z" fill="#B50B14">
                    </path>
                  </svg>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* 分页按钮 */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrevPage}
            disabled={pageStart === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            上一页
          </button>
          <button
            onClick={handleNextPage}
            disabled={pageStart + 20 >= total}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            下一页
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
