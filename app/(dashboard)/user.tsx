'use client'
import { Button } from '@/components/ui/button';
// import { auth, signOut } from '@/lib/auth';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useUser } from '@/store/nav';
import Avatar from '@/images/a2.jpg';

export function User() {
  const { user } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Image
            src={Avatar.src}
            width={36}
            height={36}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>我的账号</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>权限: <span style={{color: '#1485ee', marginLeft: '8px'}}>平台所有者</span></DropdownMenuItem>
        {/* <DropdownMenuItem>技术支持</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem>
            <button type="submit" onClick={()=>{
              useUser.setState({user: {username: '',image: '', role: '', token: ''}})
            }}>退出登录</button>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Link href="/login">登录</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
