'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNav } from '@/store/nav';

export function NavItem({
  href,
  label,
  children,
  nav1,
  nav2
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  nav1?: string;
  nav2?: string;
}) {
  const pathname = usePathname();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          onClick={()=>{
            if(nav1 && nav2){
              useNav.setState({navItem:[nav1,nav2]});
            }
          }}
          className={clsx(
            'flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground',
            {
              'bg-accent text-black': pathname === href
            }
          )}
        >
          {children}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
