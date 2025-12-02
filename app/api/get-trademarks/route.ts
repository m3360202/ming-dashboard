import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RESULT_DIR = path.join(process.cwd(), 'result', '无效答辩');

export async function GET() {
  try {
    // 检查目录是否存在
    if (!fs.existsSync(RESULT_DIR)) {
      return NextResponse.json(
        { success: false, error: '商标目录不存在' },
        { status: 404 }
      );
    }

    // 获取所有子目录
    const dirs = fs.readdirSync(RESULT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return NextResponse.json({
      success: true,
      trademarks: dirs,
      total: dirs.length
    });
  } catch (error) {
    console.error('获取商标列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}


