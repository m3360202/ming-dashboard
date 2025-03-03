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
import { useUser } from '@/store/nav';
import { uploadFile } from '@/utils/upload';

export default function ContractTemplatePage() {
  const { role } = useUser();
  const [data, setData] = useState<any[]>([]);
  const [pageStart, setPageStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<number | null>(null); // 1: update, 2: create
  const [open, setOpen] = useState<boolean>(false);
  const [contractName, setContractName] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [file, setFile] = useState<any | null>(null);

  const [currentId, setCurrentId] = useState<number | null>(null); // 当前编辑的用户 ID

  const getTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/listTemplate', {
        pageStart,
        pageSize: 20,
      });

      if (res?.data?.data) {
        console.log('------', res?.data?.data);
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
    getTemplates();
  }, [pageStart]);

  const handleNextPage = () => {
    setPageStart((prev) => prev + 20);
  };

  const handlePrevPage = () => {
    setPageStart((prev) => Math.max(prev - 20, 0));
  };

  // 处理创建或更新用户
  const handleSubmit = () => {
    if (type === 1) {
      handleUpdateContract();
    } else {
      handleSaveContract();
    }
  }

  const handleSaveContract = async () => {
    try {
      if (!contractName || !file) {
        alert('请填写合同名称以及上传文件');
        return;
      }
      const result = await uploadFile(file[0]);
      // 更新
      const updateData: any = {
        name: contractName,
        url: result,
        add_time: Date.now()
      };

      await axios.post('https://ai.aliensoft.com.cn/api/saveTemplate', updateData);
      alert('上传成功');
      // 关闭 Dialog 并刷新数据
      setOpen(false);
      getTemplates();
    } catch (error) {
      console.log('error', error);
      alert('操作失败');
    }
  };

  const handleUpdateContract = async () => {
    try {
      if (!contractName || !url) {
        alert('请填写合同名称以及上传文件');
        return;
      }
      // 更新用户
      const updateData: any = {
        id: currentId,
        name: contractName,
        add_time: Date.now()
      };

      await axios.post('https://ai.aliensoft.com.cn/api/editTemplate', updateData);
      alert('更新成功');
      // 关闭 Dialog 并刷新数据
      setOpen(false);
      getTemplates();
    } catch (error) {
      console.log('error', error);
      alert('操作失败');
    }
  };

  const handleDeleteContract = async (id: number) => {
    try {
      // 更新用户
      const updateData: any = {
        id
      };

      await axios.post('https://ai.aliensoft.com.cn/api/deleteTemplate', updateData);
      alert('删除成功');
      // 关闭 Dialog 并刷新数据
      setOpen(false);
      getTemplates();
    } catch (error) {
      console.log('error', error);
      alert('操作失败');
    }
  };

  // 打开 Dialog 并设置类型
  const openDialog = (type: number, contractId?: number) => {
    setType(type);
    setOpen(true);
    if (type === 1 && currentId) {
      setCurrentId(contractId as number);
      // 设置当前编辑用户的用户名（如果需要）
      const contract: any = data.find((u: any) => u.id === contractId);
      if (contract) {
        setContractName(contract.name);
        setUrl(contract.url);
      }
    } else {
      setContractName('');
      setUrl('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>合同模板列表</CardTitle>
        <CardDescription style={{ marginTop: '10px' }}>
          浏览并下载您企业下的签约合同模板。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 添加按钮 */}
        <div className="w-full flex justify-end mb-4">
          <Button
            size="sm"
            className="h-8 gap-1"
            onClick={() => openDialog(2)} // 打开创建用户的 Dialog
          >
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              添加合同模板
            </span>
          </Button>
        </div>

        {loading ? (
          <p>加载中...</p>
        ) : (
          <div className="space-y-4">
            {/* 表头 */}
            <div className="w-full grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg font-semibold">
              <div>合同名称</div>
              <div>上传日期</div>
              <div>下载文件</div>
            </div>

            {/* 数据行 */}
            {data.map((contract: any) => (
              <div key={contract.id} className="w-full grid grid-cols-3 gap-4 p-4 border rounded-lg">
                <div onClick={() => {
                    window.open('https://hypergpt.oss-ap-southeast-1.aliyuncs.com/' + contract.url, '_blank')
                  }} style={{ fontWeight: '400', fontSize: '14px', color: '#1485ee', cursor: 'pointer' }}>{contract.name}</div>
                <div style={{ fontWeight: '400', fontSize: '14px' }}> {contract.created_at} </div>
                <div className="flex flex-row justify-start gap-8">
                  <span onClick={() => {
                    window.open('https://hypergpt.oss-ap-southeast-1.aliyuncs.com/' + contract.url, '_blank')
                  }}
                  style={{ color: '#10AEEF', fontSize: '14px', cursor: 'pointer' }}
                  className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    下载
                  </span>
                  {role === 1 &&(
                    <span
                    onClick={() => {
                      if (window.confirm('你确定要删除这个合同吗？')) {
                        handleDeleteContract(contract.id);
                      }
                    }}
                    style={{ color: '#fa5151', fontSize: '14px', cursor: 'pointer' }}
                    className="sr-only sm:not-sr-only sm:whitespace-nowrap"
                  >
                    删除
                  </span>
                  )}
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
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[90vw] max-w-md">
              <Dialog.Title className="text-lg font-bold mb-4">
                {type === 1 ? '更新合同' : '创建合同'}
              </Dialog.Title>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">合同名称</label>
                <Input
                  name="contractName"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="请输入合同名称..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] mt-2"
                />
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">合同文件</label>
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
              <Button className="w-full mt-8" onClick={handleSubmit}>
                {type === 1 ? '更新' : '创建'}
              </Button>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </CardContent>
    </Card>
  );
}
