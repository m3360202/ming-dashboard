'use client'
import Link from 'next/link';
import {
  LineChart,
  PanelLeft,
  Settings,
  Users2
} from 'lucide-react';
import Image from 'next/image';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import Providers from './providers';
import { NavItem } from './nav-item';
import { SearchInput } from './search';
import logoPng from '@/images/logo2.jpg';
import pdfPng from '@/images/Pdf.png';
import { useNav, useUser } from '@/store/nav';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import Meetpng from '@/images/meet.jpg';
import Docpng from '@/images/doc.png';
import Boardpng from '@/images/Board.png';
import Dspng from '@/images/deepseek.png';
import Mingpng from '@/images/ming.jpeg';
import Hyperpng from '@/images/hyper.jpeg';
import axios from 'axios';
import Qrcodepng from '@/images/qrcode.png';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { navItem } = useNav();
  const { username, role, isHydrated } = useUser();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const checkUser = async () => {
    // 确保状态已经加载完成
    if (!isHydrated) return;

    if (isHydrated && username === 'unknown' && role === 0) {
      window.location.href = '/login';
    }
    if (username && username !== 'unknown' && role && role !== 0) {
      try {
        const res = await axios.post('https://ai.aliensoft.com.cn/api/mingchengscheckUser', { username }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (res?.data?.success === true) {
          const role = res?.data?.data?.role;
          if (role === 0) {
            alert('您的账号已被禁用，即将退出登录');
            useUser.setState({ username: 'unknown', role: 0 });
            window.location.href = '/login';
          } else {
            useUser.setState({ username: res?.data?.data?.username, role: res?.data?.data?.role, realname: res?.data?.data?.real_name, userId: res?.data?.data?.id });
            if (res?.data?.data?.role !== 1) {
              window.location.href = '/contract';
            }
          }
        } else {
          alert(res?.data?.message);
        }
      } catch (error) {
        console.log('error', error);
        alert('请求失败');
      }
    }
  };

  useEffect(() => {
    checkUser();
  }, [username, role, isHydrated]);

  return (
    <Providers>
      {role && role !== 0 && username && username !== "" && (
        <main className="flex min-h-screen w-full flex-col bg-muted/40">
          <DesktopNav role={role as number} username={username} />
          <div className="w-full flex flex-col sm:gap-4 sm:py-4 sm:pl-48">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <MobileNav role={role as number} />
              <DashboardBreadcrumb navItem={navItem} />
              <SearchInput />
              <span onClick={handleOpen} style={{ color: '#1485ee', fontSize: '14px', cursor: 'pointer' }}>常用配套平台</span>
              <User />
            </header>
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[90vw] max-w-md">
                  <Dialog.Title className="text-lg font-bold mb-4">常用平台快捷链接</Dialog.Title>
                  <div className="mb-6" style={{ color: '#999', fontSize: '14px', fontWeight: '400' }}>
                    以下是基于Aliensoft AIGC创建的平台或第三方应用平台.

                    <div className="flex flex-row items-center justify-between w-full p-10 gap-4 flex-wrap">
                      <div onClick={() => { window.open('https://hypergpt.aliensoft.com.cn/', '_blank') }} className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image alt='HyperGPT' src={Hyperpng} width="50" height="50" />
                        <span>HyperGPT</span>
                        <span>AI 对话助手</span>
                      </div>
                      <div onClick={() => { window.open('https://chat.deepseek.com/', '_blank') }} className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image alt='DeepSeek' src={Dspng} width="50" height="50" />
                        <span>DeepSeek</span>
                        <span>AI 三方助手</span>
                      </div>
                      <div onClick={() => { window.open('http://minggpt.aliensoft.com.cn/', '_blank') }} className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image alt='MingTrans' src={Mingpng} width="50" height="50" />
                        <span>MingTrans</span>
                        <span>AI 图片翻译</span>
                      </div>
                      <div onClick={() => { window.open('https://app.boardx.us', '_blank') }} className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image alt='BoardX' src={Boardpng} width="50" height="50" />
                        <span>BoardX</span>
                        <span>在线协作画板</span>
                      </div>
                      <div onClick={() => { window.open('https://doc.qq.com', '_blank') }} className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image alt='腾讯文档' src={Docpng} width="50" height="50" />
                        <span>腾讯文档</span>
                        <span>云文档存储</span>
                      </div>
                      <div onClick={() => { window.open('https://meeting.qq.com', '_blank') }} className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image alt='腾讯会议' src={Meetpng} width="50" height="50" />
                        <span>腾讯会议</span>
                        <span>在线会议</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Dialog.Close asChild>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleClose}
                      >
                        关闭窗口
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
              {children}
            </main>
          </div>
          <Analytics />
        </main>
      )}
    </Providers>
  );
}

function DesktopNav({ role, username }: { role: number; username: String; }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-48 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <div className="flex flex-col items-center">
          <Image alt='智慧树' src={logoPng} width="120" height="40" />
          <span className="text-[#637381] mt-2">知产行业服务系统</span>
        </div>
        {role && role === 1 && (
          <NavItem href="trade-mark-agent" label="TradeMarkAi" nav1={'商标目标探测'} nav2={'商户需求AI探测'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-6 justify-start">
              <svg fill="rgb(100, 116, 139)" className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" p-id="4238"></path><path d="M599.5 549.3c34.8-12.8 78.4-49 78.4-119.2 0-71.2-45.5-131.1-144.2-131.1H378c-4.4 0-8 3.6-8 8v410c0 4.4 3.6 8 8 8h54.5c4.4 0 8-3.6 8-8V561.2h88.7l74.6 159.2c1.3 2.8 4.1 4.6 7.2 4.6h62c1.2 0 2.4-0.3 3.5-0.8 4-2 5.6-6.7 3.6-10.7l-80.6-164.2zM522 505h-81.5V357h83.4c48 0 80.9 25.3 80.9 75.5 0 46.9-29.8 72.5-82.8 72.5z"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">商标目标客户</span>
            </div>
          </NavItem>
        )}
        {role && role === 1 && (
          <NavItem href="trade-mark-check" label="TradeMarkCompare" nav1={'近似商标查询'} nav2={'查询器'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M358.869333 370.304c32.768-158.523733 187.733333-260.411733 346.24-227.643733 158.5152 32.810667 260.181333 187.9296 227.413334 346.581333-32.7168 158.523733-187.733333 260.4032-346.24 227.643733-158.506667-32.810667-260.266667-188.0576-227.413334-346.581333z m329.216-154.8544c-117.504-24.260267-232.405333 51.285333-256.64 168.8832-24.234667 117.640533 51.2 232.6528 168.746667 256.8704 117.504 24.260267 232.413867-51.242667 256.768-168.8832 24.234667-117.469867-51.2-232.482133-168.874667-256.8704zM125.44 790.144h551.125333c22.144 0 40.106667 17.962667 40.106667 40.149333a40.106667 40.106667 0 0 1-40.106667 40.106667H125.44a39.6544 39.6544 0 0 1-28.270933-11.6736A40.6016 40.6016 0 0 1 85.333333 830.250667c0-22.144 17.92-40.106667 40.106667-40.106667z m0-259.498667h160.341333c22.144 0 40.106667 17.954133 40.106667 40.149334a40.106667 40.106667 0 0 1-40.106667 40.106666H125.44a39.6544 39.6544 0 0 1-28.270933-11.6736A40.6016 40.6016 0 0 1 85.333333 570.743467c0-22.144 17.92-40.1408 40.106667-40.1408v0.042666z m0-267.921066h160.341333a40.149333 40.149333 0 0 1 0 80.298666H125.44a39.6544 39.6544 0 0 1-28.270933-11.6736A40.6016 40.6016 0 0 1 85.333333 302.8736c0-22.152533 17.92-40.149333 40.106667-40.149333z" fill="#607D8B" p-id="5258"></path><path d="M813.781333 641.621333L932.693333 812.202667c12.288 17.7408 4.992 40.5504-16.341333 50.7392l-5.12 2.474666c-21.333333 10.2656-48.725333 4.164267-61.013333-13.610666l-118.929067-170.666667c-12.288-17.7408-4.992-40.5504 16.341333-50.773333l5.12-2.474667c21.333333-10.231467 48.725333-4.130133 61.013334 13.738667z"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">近似商标查询</span>
            </div>
          </NavItem>)}
        {role && role === 1 && (
          <NavItem href="" label="TradeMarkCompare" nav1={''} nav2={'查询器'}>
            <div onClick={() => {
              window.open('https://ruanzhu.aliensoft.com.cn/', '_blank')
            }} className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <svg fill="rgb(100, 116, 139)" className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6948" width="20" height="20"><path d="M921.6 694.0444448c27.30666667 0 45.51111147 18.2044448 45.51111147 45.5111104v136.53333333c0 50.06222187-40.96 91.02222187-91.02222294 91.02222294H147.91111147c-50.06222187 0-91.02222187-40.96-91.02222294-91.02222294V739.5555552c0-27.30666667 18.2044448-45.51111147 45.51111147-45.5111104s45.51111147 18.2044448 45.51111147 45.5111104v136.53333333h728.17777706V739.5555552c0-27.30666667 18.2044448-45.51111147 45.51111147-45.5111104zM416.42666667 307.2l145.6355552 254.86222187L612.1244448 484.69333333c9.10222187-13.65333333 22.7555552-18.2044448 36.40888853-18.2044448h273.06666667c27.30666667 0 45.51111147 18.2044448 45.51111147 45.51111147s-18.2044448 45.51111147-45.51111147 45.51111147H671.28888853L593.92 675.84c-18.2044448 27.30666667-59.1644448 27.30666667-77.36888853-4.55111147L361.81333333 402.77333333l-136.53333333 141.0844448c-9.10222187 9.10222187-18.2044448 13.65333333-31.85777813 13.65333334H102.4c-27.30666667 0-45.51111147-18.2044448-45.51111147-45.51111147s18.2044448-45.51111147 45.51111147-45.51111147h72.81777813l168.3911104-168.3911104c22.7555552-22.7555552 54.61333333-18.2044448 72.81777814 9.10222187zM876.08888853 56.88888853c50.06222187 0 91.02222187 40.96 91.02222294 91.02222294v136.53333333c0 27.30666667-18.2044448 45.51111147-45.51111147 45.5111104s-45.51111147-18.2044448-45.51111147-45.5111104V147.91111147H147.91111147v136.53333333c0 27.30666667-18.2044448 45.51111147-45.51111147 45.5111104s-45.51111147-18.2044448-45.51111147-45.5111104V147.91111147c0-50.06222187 40.96-91.02222187 91.02222294-91.02222294h728.17777706z"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">软著生成系统</span>
            </div></NavItem>)}
        {role && role === 1 && username === 'mingcheng' && (
          <NavItem href="userList" label="Account" nav1={'账号管理'} nav2={'用户列表'}>
            <div className="flex flex-col items-start">
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
                <Users2 className="h-5 w-5" />
                <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">企业账号管理</span>
              </div>
            </div>
          </NavItem>
        )}
        {role && role === 1 && (
          <NavItem href="" label="TradeMarkCompare" nav1={''} nav2={'查询器'}>
            <div onClick={() => {
              window.open('https://docs.qq.com/mind/DTUpjeUJDeFFvWkxw?subId=BB08J2&mode=mind', '_blank')
            }} className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <svg fill="rgb(100, 116, 139)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <path d="M826.4 615.9h-40.7v-60.7c0-33.7-27.5-61.2-61.2-61.2H543.7v-85.9h40.6c39.6 0 71.9-32.3 71.9-71.9V190.9c0-39.6-32.2-71.8-71.8-71.8H439c-39.6 0-71.8 32.2-71.8 71.8v145.4c0 39.6 32.2 71.8 71.8 71.8h40.7V494h-181c-33.7 0-61.2 27.5-61.2 61.2v60.7h-40.6c-39.6 0-71.8 32.2-71.8 71.8v145.4c0 39.6 32.2 71.8 71.8 71.8h145.3c19.3 0 37.4-7.5 51-21.2 13.5-13.6 20.9-31.6 20.8-50.7V687.7c0-39.6-32.2-71.8-71.8-71.8h-40.7V558h420.2v57.9h-40.6c-39.6 0-71.8 32.2-71.8 71.8v145.4c0 39.6 32.2 71.8 71.8 71.8h145.4c19.2 0 37.3-7.5 50.9-21.1 13.5-13.6 20.9-31.6 20.8-50.7V687.7c0-39.6-32.2-71.8-71.8-71.8zM431.2 336.3V190.9c0-4.3 3.5-7.8 7.8-7.8h145.4c4.3 0 7.8 3.5 7.8 7.8v145.3c0 4.4-3.5 7.9-7.9 7.9H439c-4.3 0-7.8-3.5-7.8-7.8zM350 687.7v145.5c0 2.6-1.2 4.3-2.2 5.3-1.1 1.1-2.9 2.3-5.6 2.3H196.9c-4.3 0-7.8-3.5-7.8-7.8V687.7c0-4.3 3.5-7.8 7.8-7.8h145.3c4.3 0 7.8 3.5 7.8 7.8z m484.2 145.5c0 2.6-1.2 4.4-2.2 5.4-1 1-2.8 2.3-5.5 2.3H681.1c-4.3 0-7.8-3.5-7.8-7.8V687.7c0-4.3 3.5-7.8 7.8-7.8h145.3c4.3 0 7.8 3.5 7.8 7.8v145.5z"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">业务设计框架</span>
            </div></NavItem>)}
        <NavItem href="order" label="Order">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <svg fill="rgb(100, 116, 139)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9436" width="20" height="20"><path d="M43.047925 318.945371l-0.217999 0.332999 453.813104 262.014483a29.879941 29.879941 0 0 0 14.946971 4.019992c5.392989 0 10.686979-1.451997 15.26397-4.183991l450.339111-259.994487c14.252972-8.253984 19.133962-26.569948 10.874979-40.82792-2.681995-4.634991-6.561987-8.462983-11.163978-11.039978L528.287968 9.121982a29.850941 29.850941 0 0 0-14.945971-4.025992 29.859941 29.859941 0 0 0-16.493967 4.94499L46.870918 269.829468c-14.257972 8.189984-19.193962 26.457948-11.001979 40.721919a29.784941 29.784941 0 0 0 7.179986 8.392984zM513.234998 69.459863l389.320232 225.769555-390.939229 225.711554-390.179231-225.279555L513.234998 69.459863z m463.669085 419.147173l-84.437834-48.964903-59.686882 34.459932 69.780863 40.46992L511.616001 740.27854l-390.179231-225.272556 69.929862-40.37392-59.655882-34.442932-84.838832 48.985903c-14.257972 8.189984-19.195962 26.456948-11.001979 40.71592a29.803941 29.803941 0 0 0 7.328986 8.517983l-0.19 0.317999 453.638105 261.909484a29.875941 29.875941 0 0 0 30.209941-0.16L977.193082 540.478934c14.253972-8.257984 19.134962-26.571948 10.875979-40.82592-2.688995-4.636991-6.563987-8.466983-11.165978-11.044978z m0 219.343567l-84.089834-48.766903-59.681882 34.457932 69.427863 40.26992-390.944229 225.711555-390.179231-225.274556 69.581863-40.17992-59.653882-34.436932-84.492833 48.785903c-14.257972 8.188984-19.193962 26.457948-11.001979 40.71692a29.742941 29.742941 0 0 0 7.233986 8.436983l-0.207 0.329 453.747105 261.974483a29.895941 29.895941 0 0 0 14.946971 4.024992 29.875941 29.875941 0 0 0 15.26397-4.178992l450.339111-259.999487c14.252972-8.259984 19.133962-26.577948 10.874979-40.825919-2.681995-4.636991-6.557987-8.467983-11.164978-11.044979z" p-id="9437"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">在线合同签约</span>
            </div>
          </div>
        </NavItem>
        {role && role === 1 && username === 'mingcheng' && (<NavItem href="contract-template" label="ContractTemplate" nav1={'在线签约'} nav2={'合同模板'}>
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
            -
            <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">合同模板下载</span>
          </div>
        </NavItem>)}
        <NavItem href="contract" label="ContractTemplate" nav1={'在线签约'} nav2={'在线签约提交'}>
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
            -
            <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">在线签约提交</span>
          </div>
        </NavItem>
        {role && role === 1 && (
          <NavItem href="contract-check" label="ContractConfirm" nav1={'在线签约'} nav2={'在线签约审批'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
              -
              <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">在线签约审批</span>
            </div>
          </NavItem>
        )}
        <NavItem href="contract-history" label="ContractHistory" nav1={'在线签约'} nav2={'历史合同'}>
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
            -
            <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">历史合同记录</span>
          </div>
        </NavItem>
        <NavItem href="email-broadcast" label="EmailBroadcast" nav1={'邮件群发'} nav2={'邮件发送'}>
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start">
                <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">邮件群发系统</span>
              </div>
            </NavItem>
            <NavItem href="email-status" label="EmailStatus" nav1={'邮件群发'} nav2={'发送结果查询'}>
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
                <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M13 7H7"></path>
                  <path d="M17 11H7"></path>
                </svg>
                <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">发送结果查询</span>
              </div>
            </NavItem>

            <NavItem href="sms-broadcast" label="SmsBroadcast" nav1={'短信群发'} nav2={'短信发送'}>
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start">
                <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">短信群发系统</span>
              </div>
            </NavItem>
        {/* 二维码图片 */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <img
            src={Qrcodepng.src}
            width="120"
            height="120"
            alt="智慧树二维码"
            className="w-24 h-24 rounded-lg shadow-md"
          />
        </div>
        {/* <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <svg viewBox="0 0 1116 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M428.491785 602.127256c118.572701 0 215.038368-96.461832 215.038368-215.046038 0-118.572701-96.457997-215.026864-215.038368-215.026864C309.942092 172.054354 213.468756 268.504682 213.468756 387.073549c-0.007669 118.591875 96.477171 215.053707 215.023029 215.053707z m0-368.644872c84.689309 0 153.58733 68.878848 153.58733 153.602669 0 84.704647-68.909526 153.625677-153.58733 153.625677-84.716151 0-153.610338-68.92103-153.610339-153.625677 0.003835-84.723821 68.890352-153.602669 153.610339-153.602669z m295.685904 403.011436c66.175386-78.373561 101.964624-183.198869 88.589197-296.195919-20.833915-176.733568-163.227761-318.107385-340.022685-337.836907C239.537034-23.499912 41.394346 159.077736 41.394346 387.085053c0 96.35446 35.50547 184.544848 93.980782 252.334642L13.888056 860.428688c-4.517274 8.171742 1.438012 18.191808 10.779336 18.191808h142.60092a24.450035 24.450035 0 0 1 20.473454 11.066939l84.056583 128.772998c5.027289 7.68857 16.377996 7.351116 20.983468-0.57137l137.788374-240.270681 137.861233 240.2285c4.524944 7.976172 15.864146 8.309791 20.89527 0.617386l84.129443-128.780668a24.484548 24.484548 0 0 1 20.419768-11.074608h142.662275c9.341325 0 15.23909-10.004727 10.79851-18.184139l-123.159001-223.931033z m-338.220376-572.321029c212.764392-27.138159 392.538876 152.655499 365.462072 365.458238-18.533096 145.292878-135.134763 261.898379-280.408467 280.389294C258.212014 737.104796 78.468207 557.318808 105.55268 344.581259c18.536931-145.308217 135.058069-261.902214 280.404633-280.408468z m-111.934839 845.351537L221.011607 828.255571a24.427027 24.427027 0 0 0-20.469619-11.082278H121.006514a7.81128 7.81128 0 0 1-6.852606-11.588458l66.716079-121.318345A385.486866 385.486866 0 0 0 364.778275 768.840758l-80.501818 140.353786a6.001303 6.001303 0 0 1-8.198585 2.243299 6.461466 6.461466 0 0 1-2.055398-1.913515z m366.175326-81.268757l-53.095231 81.268757a5.924609 5.924609 0 0 1-10.15428-0.318279l-80.92747-141.093884a385.789807 385.789807 0 0 0 182.972622-86.292212l69.561425 126.499022a5.970625 5.970625 0 0 1-5.27271 8.858153h-82.595564a24.469209 24.469209 0 0 0-20.488792 11.078443z" ></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">专利目标探测</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（预计3月上线）</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M731.591111 133.12h-92.16V15.928889H68.835556v967.111111h428.942222v-56.888889H125.724444v-853.333333h456.817778v471.04h56.888889V190.008889h61.44v197.404444h192.284445v248.604445h56.888888V355.555556l-218.453333-222.435556z" p-id="8334"></path><path d="M226.417778 142.222222h71.111111v128.568889H226.417778zM410.737778 142.222222h71.111111v128.568889H410.737778zM226.417778 353.848889h71.111111v128.568889H226.417778zM410.737778 353.848889h71.111111v128.568889H410.737778zM226.417778 557.511111h71.111111v128.568889H226.417778zM410.737778 557.511111h71.111111v128.568889H410.737778zM585.955556 596.764444L471.608889 796.444444l113.777778 198.542223h227.555555l113.777778-198.542223-113.777778-198.542222z m196.835555 341.333334h-163.84L537.031111 796.444444l81.92-141.653333h163.84L864.142222 796.444444z" p-id="8335"></path><path d="M700.871111 795.306667m-56.888889 0a56.888889 56.888889 0 1 0 113.777778 0 56.888889 56.888889 0 1 0-113.777778 0Z" p-id="8336"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">高新服务探测</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（预计4月上线）</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9436" width="20" height="20"><path d="M43.047925 318.945371l-0.217999 0.332999 453.813104 262.014483a29.879941 29.879941 0 0 0 14.946971 4.019992c5.392989 0 10.686979-1.451997 15.26397-4.183991l450.339111-259.994487c14.252972-8.253984 19.133962-26.569948 10.874979-40.82792-2.681995-4.634991-6.561987-8.462983-11.163978-11.039978L528.287968 9.121982a29.850941 29.850941 0 0 0-14.945971-4.025992 29.859941 29.859941 0 0 0-16.493967 4.94499L46.870918 269.829468c-14.257972 8.189984-19.193962 26.457948-11.001979 40.721919a29.784941 29.784941 0 0 0 7.179986 8.392984zM513.234998 69.459863l389.320232 225.769555-390.939229 225.711554-390.179231-225.279555L513.234998 69.459863z m463.669085 419.147173l-84.437834-48.964903-59.686882 34.459932 69.780863 40.46992L511.616001 740.27854l-390.179231-225.272556 69.929862-40.37392-59.655882-34.442932-84.838832 48.985903c-14.257972 8.189984-19.195962 26.456948-11.001979 40.71592a29.803941 29.803941 0 0 0 7.328986 8.517983l-0.19 0.317999 453.638105 261.909484a29.875941 29.875941 0 0 0 30.209941-0.16L977.193082 540.478934c14.253972-8.257984 19.134962-26.571948 10.875979-40.82592-2.688995-4.636991-6.563987-8.466983-11.165978-11.044978z m0 219.343567l-84.089834-48.766903-59.681882 34.457932 69.427863 40.26992-390.944229 225.711555-390.179231-225.274556 69.581863-40.17992-59.653882-34.436932-84.492833 48.785903c-14.257972 8.188984-19.193962 26.457948-11.001979 40.71692a29.742941 29.742941 0 0 0 7.233986 8.436983l-0.207 0.329 453.747105 261.974483a29.895941 29.895941 0 0 0 14.946971 4.024992 29.875941 29.875941 0 0 0 15.26397-4.178992l450.339111-259.999487c14.252972-8.259984 19.133962-26.577948 10.874979-40.825919-2.681995-4.636991-6.557987-8.467983-11.164978-11.044979z" p-id="9437"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">项目申报探测</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（预计5月上线）</span>
          </div>
        </NavItem>
        <NavItem href="customers" label="Customers">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <Users2 className="h-5 w-5" />
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">客户档案画像</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（预计6月上线）</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Analytics">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <LineChart className="h-5 w-5" />
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">业务动态分析</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（预计6月上线）</span>
          </div>
        </NavItem> */}
        {/* {role && role === 1 && (
          <a href="https://docs.qq.com/mind/DTUpjeUJDeFFvWkxw?subId=BB08J2&mode=mind" target="_blank">
            <div className="flex flex-col justify-start items-center mt-2">
              <Image alt='plan 2025' src={pdfPng} width="35" height="50" />
              <div className="text-[#333] text-[14px] mt-2">
                业务设计框架
              </div>

            </div>
          </a>
        )} */}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav({ role }: { role: number }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          {role && role === 1 && (<NavItem href="trade-mark-check" label="TradeMarkCompare" nav1={'近似商标查询'} nav2={'查询器'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-6 justify-start">
              <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M358.869333 370.304c32.768-158.523733 187.733333-260.411733 346.24-227.643733 158.5152 32.810667 260.181333 187.9296 227.413334 346.581333-32.7168 158.523733-187.733333 260.4032-346.24 227.643733-158.506667-32.810667-260.266667-188.0576-227.413334-346.581333z m329.216-154.8544c-117.504-24.260267-232.405333 51.285333-256.64 168.8832-24.234667 117.640533 51.2 232.6528 168.746667 256.8704 117.504 24.260267 232.413867-51.242667 256.768-168.8832 24.234667-117.469867-51.2-232.482133-168.874667-256.8704zM125.44 790.144h551.125333c22.144 0 40.106667 17.962667 40.106667 40.149333a40.106667 40.106667 0 0 1-40.106667 40.106667H125.44a39.6544 39.6544 0 0 1-28.270933-11.6736A40.6016 40.6016 0 0 1 85.333333 830.250667c0-22.144 17.92-40.106667 40.106667-40.106667z m0-259.498667h160.341333c22.144 0 40.106667 17.954133 40.106667 40.149334a40.106667 40.106667 0 0 1-40.106667 40.106666H125.44a39.6544 39.6544 0 0 1-28.270933-11.6736A40.6016 40.6016 0 0 1 85.333333 570.743467c0-22.144 17.92-40.1408 40.106667-40.1408v0.042666z m0-267.921066h160.341333a40.149333 40.149333 0 0 1 0 80.298666H125.44a39.6544 39.6544 0 0 1-28.270933-11.6736A40.6016 40.6016 0 0 1 85.333333 302.8736c0-22.152533 17.92-40.149333 40.106667-40.149333z" fill="#607D8B" p-id="5258"></path><path d="M813.781333 641.621333L932.693333 812.202667c12.288 17.7408 4.992 40.5504-16.341333 50.7392l-5.12 2.474666c-21.333333 10.2656-48.725333 4.164267-61.013333-13.610666l-118.929067-170.666667c-12.288-17.7408-4.992-40.5504 16.341333-50.773333l5.12-2.474667c21.333333-10.231467 48.725333-4.130133 61.013334 13.738667z"></path></svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">近似商标查询</span>
            </div>
          </NavItem>)}
          {role && role === 1 && (
            <NavItem href="#" label="TradeMark">
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
                <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" p-id="4238"></path><path d="M599.5 549.3c34.8-12.8 78.4-49 78.4-119.2 0-71.2-45.5-131.1-144.2-131.1H378c-4.4 0-8 3.6-8 8v410c0 4.4 3.6 8 8 8h54.5c4.4 0 8-3.6 8-8V561.2h88.7l74.6 159.2c1.3 2.8 4.1 4.6 7.2 4.6h62c1.2 0 2.4-0.3 3.5-0.8 4-2 5.6-6.7 3.6-10.7l-80.6-164.2zM522 505h-81.5V357h83.4c48 0 80.9 25.3 80.9 75.5 0 46.9-29.8 72.5-82.8 72.5z"></path></svg>
                <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">商标目标探测</span>
              </div>
            </NavItem>
          )}
          {/* {role && role === 1 && (
            <NavItem href="trade-mark-agent" label="TradeMarkAi" nav1={'商标目标探测'} nav2={'商户需求AI探测'}>
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
                -
                <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">AI客户探测</span>
              </div>
            </NavItem>
          )}
          {role && role === 1 && (
            <NavItem href="trade-mark-bak" label="TradeMarkRecord" nav1={'商标目标探测'} nav2={'客户收藏夹'}>
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
                -
                <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">客户收藏夹</span>
              </div>
            </NavItem>
          )} */}
          {role && role === 1 && (
            <NavItem href="userList" label="Account" nav1={'账号管理'} nav2={'用户列表'}>
              <div className="flex flex-col items-start">
                <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
                  <Users2 className="h-5 w-5" />
                  <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">企业账号管理</span>
                </div>
              </div>
            </NavItem>
          )}
          <NavItem href="order" label="Order">
            <div className="flex flex-col items-start">
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9436" width="20" height="20"><path d="M43.047925 318.945371l-0.217999 0.332999 453.813104 262.014483a29.879941 29.879941 0 0 0 14.946971 4.019992c5.392989 0 10.686979-1.451997 15.26397-4.183991l450.339111-259.994487c14.252972-8.253984 19.133962-26.569948 10.874979-40.82792-2.681995-4.634991-6.561987-8.462983-11.163978-11.039978L528.287968 9.121982a29.850941 29.850941 0 0 0-14.945971-4.025992 29.859941 29.859941 0 0 0-16.493967 4.94499L46.870918 269.829468c-14.257972 8.189984-19.193962 26.457948-11.001979 40.721919a29.784941 29.784941 0 0 0 7.179986 8.392984zM513.234998 69.459863l389.320232 225.769555-390.939229 225.711554-390.179231-225.279555L513.234998 69.459863z m463.669085 419.147173l-84.437834-48.964903-59.686882 34.459932 69.780863 40.46992L511.616001 740.27854l-390.179231-225.272556 69.929862-40.37392-59.655882-34.442932-84.838832 48.985903c-14.257972 8.189984-19.195962 26.456948-11.001979 40.71592a29.803941 29.803941 0 0 0 7.328986 8.517983l-0.19 0.317999 453.638105 261.909484a29.875941 29.875941 0 0 0 30.209941-0.16L977.193082 540.478934c14.253972-8.257984 19.134962-26.571948 10.875979-40.82592-2.688995-4.636991-6.563987-8.466983-11.165978-11.044978z m0 219.343567l-84.089834-48.766903-59.681882 34.457932 69.427863 40.26992-390.944229 225.711555-390.179231-225.274556 69.581863-40.17992-59.653882-34.436932-84.492833 48.785903c-14.257972 8.188984-19.193962 26.457948-11.001979 40.71692a29.742941 29.742941 0 0 0 7.233986 8.436983l-0.207 0.329 453.747105 261.974483a29.895941 29.895941 0 0 0 14.946971 4.024992 29.875941 29.875941 0 0 0 15.26397-4.178992l450.339111-259.999487c14.252972-8.259984 19.133962-26.577948 10.874979-40.825919-2.681995-4.636991-6.557987-8.467983-11.164978-11.044979z" p-id="9437"></path></svg>
                <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">在线合同签约</span>
              </div>
            </div>
          </NavItem>
          <NavItem href="contract-template" label="ContractTemplate" nav1={'在线签约'} nav2={'合同模板'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
              -
              <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">合同模板下载</span>
            </div>
          </NavItem>
          <NavItem href="contract" label="ContractTemplate" nav1={'在线签约'} nav2={'在线签约提交'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
              -
              <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">在线签约提交</span>
            </div>
          </NavItem>
          {role && role === 1 && (
            <NavItem href="contract-check" label="ContractConfirm" nav1={'在线签约'} nav2={'在线签约审批'}>
              <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
                -
                <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">在线签约审批</span>
              </div>
            </NavItem>
          )}
          <NavItem href="contract-history" label="ContractHistory" nav1={'在线签约'} nav2={'历史合同'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
              -
              <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">历史合同记录</span>
            </div>
          </NavItem>
          <NavItem href="email-broadcast" label="EmailBroadcast" nav1={'邮件群发'} nav2={'邮件发送'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start">
              <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">邮件群发系统</span>
            </div>
          </NavItem>
          <NavItem href="email-status" label="EmailStatus" nav1={'邮件群发'} nav2={'发送结果查询'}>
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
              <svg className="text-[rgb(100, 116, 139)] hover:text-[#1c252e]" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M13 7H7"></path>
                <path d="M17 11H7"></path>
              </svg>
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">发送结果查询</span>
            </div>
          </NavItem>

        </nav>

        <nav className="mt-auto flex flex-col items-start justify-start gap-4 px-2 sm:py-5">


          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="left">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function DashboardBreadcrumb(nav: any) {
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="#">系统总览</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="#">{nav?.navItem?.[0]}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {nav?.navItem?.[1] && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{nav?.navItem?.[1]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

      </BreadcrumbList>
    </Breadcrumb>
  );

}
