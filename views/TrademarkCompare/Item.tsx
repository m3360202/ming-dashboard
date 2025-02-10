import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';

export function ItemDetail({ product, index }: { product: any; index: number; }) {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <img
          alt="Product image"
          className="aspect-square rounded-md object-cover"
          height="64"
          src={product.tmImg}
          width="64"
        />
      </TableCell>
      <TableCell className="font-medium">{index===0 ? '95%' : '40%'}</TableCell>
      <TableCell className="font-medium">第{product.cls}类 {product.cn}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {product.id}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{product.state_cn}</TableCell>
      <TableCell className="hidden md:table-cell">{product.appliant
      }</TableCell>
      <TableCell className="hidden md:table-cell">
        {product.appDate}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              <form >
                <button type="submit">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
