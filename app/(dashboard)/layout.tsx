'use client'
import Link from 'next/link';
import {
  Box,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2
} from 'lucide-react';

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

import { useNav } from '@/store/nav';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { navItem } = useNav();
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav />
        <div className="w-full flex flex-col sm:gap-4 sm:py-4 sm:pl-44">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <DashboardBreadcrumb navItem={navItem} />
            <SearchInput />
            <User />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-40 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <div className="flex flex-col">
          <img src={logoPng.src} width="120" height="40" />
          <span className="text-[#637381] mt-2">商业数据探测系统</span>
        </div>
        <NavItem href="#" label="TradeMark">
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-10 justify-start">
            <Home className="h-5 w-5" />
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">商标目标探测</span>
          </div>
        </NavItem>
        <NavItem href="trade-mark-agent" label="TradeMarkAi" nav1={'商标目标探测'} nav2={'商户需求AI探测'}>
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
            -
            <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">AI客户探测</span>
          </div>
        </NavItem>
        <NavItem href="trade-mark-bak" label="TradeMarkRecord" nav1={'商标目标探测'} nav2={'客户收藏夹'}>
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
            -
            <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">客户收藏夹</span>
          </div>
        </NavItem>
        <NavItem href="#" label="TradeMarkCompare">
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
            <Home className="h-5 w-5" />
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">近似商标查询</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <Home className="h-5 w-5" />
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">专利目标探测</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（开发中 3月上线）</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <Home className="h-5 w-5" />
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">高新服务探测</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（预计4月上线）</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <Home className="h-5 w-5" />
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
        </NavItem>
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

function MobileNav() {
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
        <NavItem href="#" label="TradeMark">
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-10 justify-start">
            <Home className="h-5 w-5" />
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">商标目标探测</span>
          </div>
        </NavItem>
        <NavItem href="trade-mark-agent" label="TradeMarkAi">
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
            -
            <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">AI客户探测</span>
          </div>
        </NavItem>
        <NavItem href="#" label="TradeMarkRecord">
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] justify-start ml-4">
            -
            <span className="text-[rgb(100, 116, 139)] text-[14px] hover:text-[#1c252e]">客户收藏夹</span>
          </div>
        </NavItem>
        <NavItem href="#" label="TradeMarkCompare">
          <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
            <Home className="h-5 w-5" />
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">近似商标查询</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <Home className="h-5 w-5" />
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">专利目标探测</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（开发中 3月上线）</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <Home className="h-5 w-5" />
              <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">高新服务探测</span>
            </div>
            <span className="text-[rgb(100, 116, 139)] font-[14px] hover:text-[#1c252e]">（预计4月上线）</span>
          </div>
        </NavItem>
        <NavItem href="#" label="Dashboard">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-[#1c252e] mt-2 justify-start">
              <Home className="h-5 w-5" />
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
        </NavItem>
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
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{nav?.navItem?.[1]}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
 
}
