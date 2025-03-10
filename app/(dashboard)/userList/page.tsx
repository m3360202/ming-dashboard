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

export default function CustomersPage() {
  const [data, setData] = useState([]);
  const [pageStart, setPageStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<number | null>(null); // 1: update, 2: create
  const [open, setOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [realName, setRealName] = useState<string>('');
  const [role, setRole] = useState<number>(1);
  const [status, setStatus] = useState<number>(1);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // 当前编辑的用户 ID

  const getData = async (pageNo: any) => {
    setLoading(true);
    try {
      const res = await axios.post('https://ai.aliensoft.com.cn/api/memberList', {
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
    getData(pageStart);
  }, [pageStart]);

  const handleNextPage = () => {
    setPageStart((prev) => prev + 20);
  };

  const handlePrevPage = () => {
    setPageStart((prev) => Math.max(prev - 20, 0));
  };

  const getRoleTag = (role: number) => {
    switch (role) {
      case 1:
        return <span style={{ fontSize: '12px'}} className="bg-blue-500 text-white px-2 py-1 rounded">平台所有者</span>;
      case 2:
        return <span style={{ fontSize: '12px'}} className="bg-green-500 text-white px-2 py-1 rounded">企业员工</span>;
      case 3:
        return <span style={{ fontSize: '12px'}} className="bg-purple-500 text-white px-2 py-1 rounded">加盟管理员</span>;
      default:
        return <span style={{ fontSize: '12px'}} className="bg-gray-500 text-white px-2 py-1 rounded">未知</span>;
    }
  };

  // 处理创建或更新用户
  const handleSubmit = async () => {

    try {
      if (type === 1) {
        if (!username || !realName || !company) {
          alert('请填写所有必填字段');
          return;
        }
        // 更新用户
        const updateData: any = {
          id: currentUserId,
          username,
          company,
          real_name: realName,
          role,
          status,
        };
  
        // 只有当密码不是占位符时，才添加密码字段
        if (password !== '********') {
          updateData.password = password;
        }
  
        await axios.post('https://ai.aliensoft.com.cn/api/mingchengedit', updateData);
        alert('用户更新成功');
      } else if (type === 2) {
        if (!username || !realName || !company || !password) {
          alert('请填写所有必填字段');
          return;
        }
        // 创建用户
        await axios.post('https://ai.aliensoft.com.cn/api/mingchengregister', {
          username,
          password,
          company,
          real_name: realName,
          role,
          status,
        });
        alert('用户创建成功');
      }

      // 关闭 Dialog 并刷新数据
      setOpen(false);
      getData(pageStart);
    } catch (error) {
      console.log('error', error);
      alert('操作失败');
    }
  };

  // 打开 Dialog 并设置类型
  const openDialog = (type: number, userId?: number) => {
    setType(type);
    setOpen(true);
    if (type === 1 && userId) {
      setCurrentUserId(userId);
      // 设置当前编辑用户的用户名（如果需要）
      const user: any = data.find((u: any) => u.id === userId);
      if (user) {
        setUsername(user.username);
        setPassword('********');
        setCompany(user.company || '');
        setRealName(user.real_name || '');
        setRole(user.role || 1);
        setStatus(user.status || 1);
      }
    } else {
      setUsername('');
      setPassword('');
      setCompany('');
      setRealName('');
      setRole(1);
      setStatus(1);
      setCurrentUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>企业账户列表</CardTitle>
        <CardDescription style={{ marginTop: '10px' }}>
          浏览您的企业下的所有已开通账户和权限。
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
              添加
            </span>
          </Button>
        </div>

        {loading ? (
          <p>加载中...</p>
        ) : (
          <div className="space-y-4">
            {/* 表头 */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-gray-100 rounded-lg font-semibold">
              <div>姓名</div>
              <div>用户名</div>
              <div>公司</div>
              <div>权限</div>
              <div>状态</div>
              <div>操作</div>
            </div>

            {/* 数据行 */}
            {data.map((user: any) => (
              <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border rounded-lg">
                <div style={{fontWeight: '400', fontSize: '14px', color: '#1485ee'}}>{user.real_name}</div>
                <div style={{fontWeight: '400', fontSize: '14px', color: '#1485ee'}}>{user.username}</div>
                <div style={{minWidth: '300px',fontWeight: '400', fontSize: '14px', color: '#fa9d3b'}}>{user.company || '无'}</div>
                <div>{getRoleTag(user.role)}</div>
                <div style={{fontWeight: '400', fontSize: '14px', color: user.status === 1 ? '#07c160' : '#ccc'}}>{user.status === 1 ? '启用' : '禁用'}</div>
                <div>
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => openDialog(1, user.id)} // 打开更新用户的 Dialog
                  >
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      编辑
                    </span>
                  </Button>
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
                {type === 1 ? '更新用户' : '创建用户'}
              </Dialog.Title>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">登录用户名</label>
              <Input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] mt-2"
              />
              </div>
              <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">密码</label>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] mt-2"
              />
              </div>
              <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">真实姓名</label>
              <Input
                name="realName"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="请输入真实姓名..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] mt-2"
              />
              </div>
              <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">企业名称</label>
              <Input
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="请输入公司名称..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] mt-2"
              />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">角色</label>
                <select
                  value={role}
                  onChange={(e) => setRole(parseInt(e.target.value))}
                  className="block w-full p-2 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 mt-2"
                >
                  <option value={1}>平台所有者</option>
                  <option value={2}>企业员工</option>
                  <option value={3}>加盟管理员</option>
                </select>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">状态</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(parseInt(e.target.value))}
                  className="block w-full p-2 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 mt-2"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
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
