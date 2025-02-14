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

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            顶尖的数据分析能力,助你成为行业顶流.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <form
            className="w-full"
          >
            <Button className="w-full">明成 Beta 1.0</Button>
          </form>
        </CardFooter>
      </Card>
      <div
        className={`flex flex-col lg:flex-row justify-between items-center mx-auto max-w-[1152px] w-full`}
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
