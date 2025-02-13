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
            <Button className="w-full">明成-数据挖掘系统Beta 0.1.4</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
