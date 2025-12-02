import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { tmName } = await request.json();
    console.log('收到请求，商标名称:', tmName);
    
    return NextResponse.json({
      success: true,
      message: '简单测试成功',
      tmName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('测试 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

