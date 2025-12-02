import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const cwd = process.cwd();
  const resultDir = path.join(cwd, 'result', '无效答辩');
  const qianshan = path.join(resultDir, '千山');
  const qianshanInfo = path.join(qianshan, '商标信息.txt');
  const promptPath = path.join(cwd, '..', 'GptService', 'prompt.md');
  
  return NextResponse.json({
    cwd,
    resultDir,
    resultDirExists: fs.existsSync(resultDir),
    qianshan,
    qianshanExists: fs.existsSync(qianshan),
    qianshanInfo,
    qianshanInfoExists: fs.existsSync(qianshanInfo),
    promptPath,
    promptPathExists: fs.existsSync(promptPath),
    files: fs.existsSync(qianshan) ? fs.readdirSync(qianshan) : []
  });
}

