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
import { useUser } from '@/store/nav';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/utils/upload';

export default function ContractHistoryPage() {
  const { role, userId } = useUser();
  const [data, setData] = useState<any[]>([]);
  const [pageStart, setPageStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchCustomer, setSearchCustomer] = useState<string>(''); // 搜索的客户名称
  const [searchIsPay, setSearchIsPay] = useState('');
  const [searchIsBack, setSearchIsBack] = useState('');

  const [open, setOpen] = useState<boolean>(false);

  const [currentId, setCurrentId] = useState<number | null>(null);
  const [contract, setContract] = useState<any | null>(null);

  const [isPay, setIsPay] = useState<boolean>(false);
  const [isBack, setIsBack] = useState<boolean>(false);
  const [file, setFile] = useState<any | null>(null);



  const getContract = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/listHistoryContract', {
        pageStart,
        pageSize: 20,
        customer: searchCustomer,
        isPay: parseInt(searchIsPay),
        isBack: parseInt(searchIsBack),
        role,
        userId
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
  }, [pageStart, searchCustomer, searchIsPay, searchIsBack]);

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
        return <div className={`${baseStyle} bg-[#FA5151]`}>待支付</div>;
      case 1:
        return <div className={`${baseStyle} bg-[#07C160]`}>已支付</div>;
      default:
        return <div className={`${baseStyle} bg-[#6467F0]`}>未知状态</div>;
    }
  }

  const getStep2 = (step: number) => {
    const baseStyle = "w-[fit-content] px-4 py-1 rounded-full text-white text-xs font-semibold";
    switch (step) {
      case 0:
        return <div className={`${baseStyle} bg-[#FA5151]`}>待签约</div>;
      case 1:
        return <div className={`${baseStyle} bg-[#07C160]`}>已签约</div>;
      default:
        return <div className={`${baseStyle} bg-[#6467F0]`}>未知状态</div>;
    }
  }
  const handleSubmit = async () => {
    setLoading(true);
    const result = file && file[0] ? await uploadFile(file[0]) : null;
    const updateData = {
      id: currentId,
      type: 'finish',
      userId: userId,
      isPay: isPay ? 1 : 0,
      isBack: isBack ? 1 : 0,
      resultContract: result
    };

    await axios.post('https://ai.aliensoft.com.cn/api/editContract', updateData);
    alert('更新成功');
    // 关闭 Dialog 并刷新数据
    setOpen(false);
    setLoading(false);
    getContract();
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
        <div className="w-full flex justify-end mb-4 gap-4">
          <Input
            placeholder="请输入客户名称或合同编号搜索..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
          <select
            value={searchIsPay}
            onChange={(e) => setSearchIsPay(e.target.value)}
            style={{border: '#ccc 1px solid', borderRadius: '8px'}}
            className="px-4 py-2 "
          >
            <option value="">付款状态</option>
            <option value={1}>已支付</option>
            <option value={0}>待支付</option>
          </select>
          <select
            value={searchIsBack}
            onChange={(e) => setSearchIsBack(e.target.value)}
            style={{border: '#ccc 1px solid', borderRadius: '8px'}}
            className="px-4 py-2"
          >
            <option value="">签约状态</option>
            <option value={1}>已签约</option>
            <option value={0}>待签约</option>
          </select>
        </div>

        {loading ? (
          <p>加载中...</p>
        ) : (
          <div className="space-y-4">
            {/* 表头 */}
            <div className="w-full grid grid-cols-9 gap-4 p-4 bg-gray-100 rounded-lg font-semibold">

              <div>合同编号</div>
              <div>合同类型</div>
              <div>客户名称</div>
              <div>合同状态</div>
              <div>提交日期</div>
              <div>合同价格</div>
              <div>提交人</div>
              <div>查看附件</div>
              <div>操作</div>
            </div>

            {/* 数据行 */}
            {data.map((contract: any) => (
              <div key={contract.id} className="w-full grid grid-cols-9 gap-4 p-4 border rounded-lg">

                <div style={{ fontWeight: '400', fontSize: '14px', color: '#1485EE' }}>{contract.contract_no}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#FA9D3B' }}>{contract.contract_type}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#1485EE' }}>{contract.customer}</div>

                <div style={{ fontWeight: '400', fontSize: '14px' }} className="flex gap-2">{getStep(contract.is_pay)} {getStep2(contract.is_back)}</div>

                <div style={{ fontWeight: '400', fontSize: '14px', color: '#6467F0' }}>{new Date(contract.confirm_time).toLocaleDateString('en-CA').split('/').join('-')}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#1485EE' }}>￥{contract.contract_price}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#6467F0' }}>{contract.username}</div>

                <div
                  onClick={() => {
                    const file = contract.contract_result || contract.contract_origin;
                    window.open('https://hypergpt.oss-ap-southeast-1.aliyuncs.com/' + file, '_blank')
                  }}
                  style={{ fontWeight: '400', fontSize: '14px' }}
                  className="flex items-center cursor-pointer justify-start pl-4">
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                    <path d="M502.592 908.448H146.816V83.52h711.552v386.656c0 15.488 10.144 25.792 25.408 25.792 15.232 0 25.408-10.304 25.408-25.792V57.792c0-12.896-12.704-25.792-25.408-25.792H121.408C108.704 32 96 44.896 96 57.792v876.416c0 12.896 12.704 25.792 25.408 25.792h381.184c15.232 0 25.408-10.304 25.408-25.792 0-15.456-10.176-25.76-25.408-25.76z" fill="#555555" p-id="5358"></path><path d="M768 544c123.2 0 224 100.8 224 224s-100.8 224-224 224-224-100.8-224-224 100.8-224 224-224z m0 32c-105.6 0-192 86.4-192 192s86.4 192 192 192 192-86.4 192-192-86.4-192-192-192z" fill="#B50B14" p-id="5359"></path><path d="M756.704 418.656c0-12.864-12.704-25.76-25.408-25.76H273.888c-12.704 0-25.408 12.896-25.408 25.76 0 12.896 12.704 25.792 25.408 25.792h457.408c12.704 0 25.408-12.896 25.408-25.792z m-332.896 128.896H278.976c-15.264 0-27.968 10.304-27.968 25.792 0 12.864 12.704 25.76 27.968 25.76h144.832c15.264 0 27.968-12.896 27.968-25.76 0-15.488-12.704-25.792-27.968-25.792z m0 154.656H278.976c-15.264 0-27.968 10.336-27.968 25.792 0 12.896 12.704 25.792 27.968 25.792h144.832c15.264 0 27.968-12.896 27.968-25.792 0-15.456-12.704-25.792-27.968-25.792z m307.488-464H273.888c-12.704 0-25.408 12.896-25.408 25.792s12.704 25.792 25.408 25.792h457.408c12.704 0 25.408-12.896 25.408-25.792s-12.704-25.792-25.408-25.792z" fill="#999999" p-id="5360"></path><path d="M814.976 646.272l1.024 0.928 45.312 43.456a23.872 23.872 0 0 1 0.96 33.792l-0.96 0.992-132.224 126.784a26.144 26.144 0 0 1-16.64 7.168l-1.472 0.032H659.2a18.88 18.88 0 0 1-19.2-17.344L640 840.96v-49.6a24 24 0 0 1 6.528-16.384l0.96-1.024 132.256-126.784a26.432 26.432 0 0 1 35.232-0.928z m74.624 188.064c3.52 0 6.4 2.752 6.4 6.144v12.288c0 1.632-0.672 3.2-1.888 4.352a6.56 6.56 0 0 1-4.512 1.824h-102.592a6.56 6.56 0 0 1-4.512-1.824 6.016 6.016 0 0 1-1.888-4.352v-12.288c0-3.392 2.88-6.144 6.4-6.144H889.6z m-128-134.976l-95.968 92v43.456h45.344l95.968-92-45.344-43.456z m128 85.792c1.696 0 3.328 0.64 4.512 1.824a6.016 6.016 0 0 1 1.888 4.352v12.288c0 3.392-2.88 6.144-6.4 6.144h-51.296c-3.52 0-6.4-2.752-6.4-6.144v-12.288c0-1.632 0.64-3.2 1.856-4.352a6.56 6.56 0 0 1 4.544-1.824H889.6z m-91.744-120.576l-18.112 17.376 45.312 43.488 18.144-17.376-45.312-43.488z" fill="#B50B14">
                    </path>
                  </svg>
                </div>
                {role === 1 && (<div style={{ cursor: 'pointer', fontWeight: '400', fontSize: '14px', color: '#1485EE' }} onClick={() => {
                  setContract(contract);
                  setOpen(true);
                  setCurrentId(contract.id);
                  setIsBack(contract.is_back === 1);
                  setIsPay(contract.is_pay === 1);
                }}>编辑</div>)}
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

        {/* Dialog */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[860px] h-[650px]" style={{ overflowY: 'scroll' }}>
              <Dialog.Title className="text-lg font-bold mb-4">
                {'编辑合同'}
              </Dialog.Title>


              <div className="flex flex-col justify-start items-start gap-4">
                <div className="mt-4 flex gap-4">
                  <label className="block text-gray-700">付款状态</label>
                  <div className='flex flex-row justify-start gap-2'>
                    <label className='flex items-center gap-2'>
                      <span>是</span>
                      <input
                        type="radio"
                        name="isPay"
                        value="true"
                        checked={isPay === true}
                        onChange={(e) => setIsPay(true)}
                      />

                    </label>
                  </div>
                  <div className='flex flex-row justify-start gap-2'>
                    <label className='flex items-center gap-2'>
                      <span>否</span>
                      <input
                        type="radio"
                        name="isPay"
                        value="false"
                        checked={isPay === false}
                        onChange={(e) => setIsPay(false)}
                      />

                    </label>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <label className="block text-gray-700">合同签署</label>
                  <label className='flex items-center gap-2'>
                    <span>是</span>
                    <input
                      type="radio"
                      name="isBack"
                      value="true"
                      checked={isBack === true}
                      onChange={(e) => setIsBack(true)}
                    />

                  </label>
                  <label className='flex items-center gap-2'>
                    <span>否</span>
                    <input
                      type="radio"
                      name="isBack"
                      value="false"
                      checked={isBack === false}
                      onChange={(e) => setIsBack(false)}
                    />

                  </label>
                </div>
                <div className="mt-2">
                  <label className="block text-gray-700">合同文件</label>
                  <Input
                    type="file"
                    id="fileInput"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        setFile(files);
                      }
                    }}
                  />
                </div>
              </div>
              <Button disabled={loading} className="w-full mt-8" onClick={handleSubmit}>
                {'更新合同状态'}
              </Button>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </CardContent>
    </Card>
  );
}
