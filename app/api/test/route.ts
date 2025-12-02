import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API 工作正常',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST 请求工作正常',
    timestamp: new Date().toISOString()
  });
}

