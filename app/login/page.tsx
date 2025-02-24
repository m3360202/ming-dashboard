'use client'
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
// import { signIn } from '@/lib/auth';
import axios from 'axios';
import { useUser } from '@/store/nav';
import { useState } from 'react'; 
import { Input } from '@/components/ui/input';


export default function LoginPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [pwd, setPwd] = useState<string | null>(null);

  const handleLogin = async() => {
    if (!pwd || !username) {
      return alert('请输入用户名和密码！');
    } else {
      const data = {
        username,
        password: pwd
      }
      try {
        const res = await axios.post('https://ai.aliensoft.com.cn/api/mingchengsignin', data, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
  
        console.log('------', res?.data);
        if (res?.data?.success === true) {
          alert("登录成功");
          useUser.setState({ username: res?.data.data.username,  role: res?.data.data.role, realname: res?.data.data.real_name });

          window.location.href = '/trade-mark-check';
          
        } else {
          alert(res?.data?.message);
        }
      } catch (error) {
        console.log('error', error);
        alert('请求失败');
      }
    }
    
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-start md:items-center p-8">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">智慧树 Beta 1.0</CardTitle>
              <CardDescription style={{ marginTop: '10px' }}>
                顶尖的数据分析能力,助你成为行业顶流.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div
                className="w-full"
              >
                <Input
                  name="q"
                  onChange={(e) => { setUsername(e.target.value as string) }}
                  placeholder="请输入用户名..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] mt-2"
                />
                <Input
                  name="q"
                  onChange={(e) => { setPwd(e.target.value as string) }}
                  type="password"
                  placeholder="请输入密码..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] mt-4 mb-8"
                />
                <Button className="w-full" onClick={handleLogin}>登录</Button>
              </div>
            </CardFooter>
          </Card>
          <div
            className={`fixed bottom-0 flex flex-col lg:flex-row justify-between items-center mx-auto max-w-[1152px] w-full`}
            style={{ padding: '24px 0' }}>
            <span style={{ fontSize: '12px', color: '#637381' }}>
              © 2025 ZhiHuiTree.
            </span>
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <a
                style={{ fontSize: '12px', color: '#637381', marginRight: '10px' }}
                href="http://www.miibeian.gov.cn/"
                target="_blank">
                {'冀ICP备13008594号-1'}
              </a>
              <span style={{ fontSize: '12px', color: '#637381' }}>
                版权所有 智慧树（北京）知识产权有限公司 技术支持 微工坊（保定）网络科技有限公司
              </span>
            </div>
          </div>
        </div>
  );
}
