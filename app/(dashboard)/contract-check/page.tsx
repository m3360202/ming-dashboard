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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
// import ContractPreview  from '@/components/PdfViewer';

export default function ContractCheckPage() {
  const [data, setData] = useState<any[]>([]);
  const [pageStart, setPageStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState<string>(''); // 搜索的客户名称

  const [open, setOpen] = useState<boolean>(false);

  const [currentContract, setCurrentContract] = useState<any | null>(null);

  const [currentId, setCurrentId] = useState<number | null>(null); // 当前编辑的用户 ID
  const [contractNo, setContractNo] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const [back, setBack] = useState<string>('');
  const [pdf, setPdf] = useState<string>('');
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const [sign1Loading, setSign1Loading] = useState<boolean>(false);
  const [sign2Loading, setSign2Loading] = useState<boolean>(false);

  const createContractNo = () => {
    let no = '01' ;
    if(currentContract?.contract_type === '商标服务') {
      no = '01'
    }
    if(currentContract?.contract_type === '版权服务') {
      no = '02'
    }
    const code = 'ZHS' + no + 'BJ' + Date.now();
    setContractNo(code);
  }

  const getContract = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/listAllContract', {
        pageStart,
        pageSize: 20,
        step: 0,
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

  const handleSubmit = async () => {
    try {
      if(!pdf || pdf === ''){
        alert('请确认后盖章');
        return false;
      }
      if(!contractNo){
        alert('请生成合同编号');
        return false;
      }
      setLoading(true);
      // 更新用户
      const updateData: any = {
        id: currentId,
        confirm_time: new Date().toLocaleDateString('en-CA').split('/').join('-'),
        status: 0,
        contract_no: contractNo,
        contract_origin: pdf,
        step: 2
      };

      await axios.post('https://ai.aliensoft.com.cn/api/editContract', updateData);
      alert('更新成功');
      // 关闭 Dialog 并刷新数据
      setOpen(false);
      setLoading(false);
      getContract();
    } catch (error) {
      console.log('error', error);
      setLoading(false);
      alert('操作失败');
    }
  };

  const handleRefuse = async () => {
    try {

      setLoading(true);
      // 更新用户
      const updateData: any = {
        id: currentId,
        refuse_text: back,
        step: 1,
      };

      await axios.post('https://ai.aliensoft.com.cn/api/editContract', updateData);
      alert('驳回成功');
      // 关闭 Dialog 并刷新数据
      setOpen(false);
      setLoading(false);
      getContract();
    } catch (error) {
      console.log('error', error);
      setLoading(false);
      alert('操作失败');
    }
  };

  const handleDeleteContract = async (id: number) => {
    try {
      // 更新用户
      const updateData: any = {
        id
      };

      await axios.post('https://ai.aliensoft.com.cn/api/deleteContract', updateData);
      alert('删除成功');
      // 关闭 Dialog 并刷新数据
      setOpen(false);
      getContract();
    } catch (error) {
      console.log('error', error);
      alert('操作失败');
    }
  };

  // 打开 Dialog 并设置类型
  const openDialog = (type: number, contractId?: number) => {
    setOpen(true);
    if (type === 1 && contractId) {
      setCurrentId(contractId);
      // 设置当前编辑用户的用户名（如果需要）
      const contract: any = data.find((u: any) => u.id === contractId);
      if (contract) {
        setCurrentContract(contract);
        console.log('controct---',contract)
        setPdfUrl(contract?.contract_origin);
      }
    } else {
      setCurrentContract(null);
    }
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
        return <div className={`${baseStyle} bg-[#FA5151]`}>已驳回，待编辑</div>;
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
            placeholder="请输入客户名称搜索..."
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
            <div className="w-full grid grid-cols-6 gap-4 p-4 bg-gray-100 rounded-lg font-semibold">
              <div>客户名称</div>
              <div>合同类型</div>
              <div>提交日期</div>
              <div>业务状态</div>
              <div>提交人</div>
              <div>操作</div>
            </div>

            {/* 数据行 */}
            {data.map((contract: any) => (
              <div key={contract.id} className="w-full grid grid-cols-6 gap-4 p-4 border rounded-lg">
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#1485EE' }}>{contract.customer}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#FA9D3B' }}>{contract.contract_type}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#6467F0' }}>{contract.created_at}</div>
                <div style={{ fontWeight: '400', fontSize: '14px' }}>{getStep(contract.step)}</div>
                <div style={{ fontWeight: '400', fontSize: '14px', color: '#6467F0' }}>{contract.username}</div>
                <div className="flex flex-row justify-start gap-8">
                  {(contract.step === 0 || contract.step === 3) && (
                    <span
                      onClick={() => openDialog(1, contract.id)}
                      style={{ color: '#10AEEF', fontSize: '14px', cursor: 'pointer' }}
                      className="sr-only sm:not-sr-only sm:whitespace-nowrap"
                    >
                      审核
                    </span>
                  )}
                  <span
                    onClick={() => handleDeleteContract(contract.id)}
                    style={{ color: '#FA5151', fontSize: '14px', cursor: 'pointer' }}
                    className="sr-only sm:not-sr-only sm:whitespace-nowrap"
                  >
                    删除
                  </span>
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

        {/* Dialog */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            {currentContract && (
              <Dialog.Content style={{ height: '800px', overflowY: 'scroll' }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[1200px]">
              <Dialog.Title className="text-lg font-bold mb-4">
                {'审核合同'}
              </Dialog.Title>
              <div className="flex justify-center items-start mt-8 gap-8">
                <div className="flex flex-col items-center gap-4">
                  <label className="block text-md font-[600] text-gray-700">合同内容</label>
                  {/* {pdfUrl && <ContractPreview pdfUrl={pdfUrl} pdf={pdf} setPdf={setPdf} />} */}
                  {/* <textarea onChange={()=>{}} value={'aaaaa'} style={{ width: '760px', padding: '10px', height: '400px', overflowY: 'scroll', border: '#ccc 1px solid', color: '#999', fontSize: '14px', lineHeight: '24px'  }} /> */}
                </div>
              </div>

              <div className="w-full my-4">
                <label className="block text-md font-[600] text-gray-700" style={{ color: '#1c252e' }}>合同信息</label>
                <div className="w-full flex justify-start items-center mt-4 gap-8">
                  <span style={{ color: '#FA5151', fontSize: '14px', fontWeight: '400' }}>服务类型：{currentContract.contract_type}</span>
                  <span style={{ color: '#FA5151', fontSize: '14px', fontWeight: '400' }}>合同价格：￥{currentContract.contract_price}</span>
                  <span style={{ color: '#FA5151', fontSize: '14px', fontWeight: '400' }}>税费：￥{currentContract.contract_tax}</span>
                </div>
              </div>

              <div className="my-8">
                <label className="block text-md font-[600] text-gray-700" style={{ color: '#1c252e' }}>客户信息</label>

                <div className="w-full flex justify-start items-center mt-4 gap-8">
                  <span style={{ color: '#FA9D3B', fontSize: '14px', fontWeight: '400' }}>客户名称：{currentContract.customer}</span>
                  <span style={{ color: '#FA9D3B', fontSize: '14px', fontWeight: '400' }}>客户联系人：{currentContract.customer_person}</span>
                </div>
                <div className="w-full flex justify-start items-center mt-2 gap-8">
                  <span style={{ color: '#FA9D3B', fontSize: '14px', fontWeight: '400' }}>联系电话：{currentContract.customer_mb}</span>
                  <span style={{ color: '#FA9D3B', fontSize: '14px', fontWeight: '400' }}>联系地址：{currentContract.customer_address}</span>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">合同编号</label>
                <div className="w-full flex justify-start items-center mt-2 gap-8">
                  <Input
                    value={contractNo as string}
                    disabled
                  />
                  <Button disabled={loading} onClick={createContractNo}>
                    {'生成'}
                  </Button>
                </div>

              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">驳回意见</label>
                <Input
                  style={{ marginTop: '6px' }}
                  value={back}
                  onChange={(e)=>setBack(e.target.value)}
                />
              </div>

              <div className="flex justify-center items-center mt-8 gap-8">
                <Button disabled={loading} onClick={handleSubmit}>
                  {'审核通过'}
                </Button>
                <Button disabled={loading} onClick={handleRefuse}>
                  {'驳回'}
                </Button>
              </div>
            </Dialog.Content>
            )}
            
          </Dialog.Portal>
        </Dialog.Root>
      </CardContent>
    </Card>
  );
}
