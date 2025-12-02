import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 商标目录路径（result 在 ming-dashboard 目录下）
const RESULT_DIR = path.join(process.cwd(), 'result', '无效答辩');

// 读取 prompt 模板（GptService 和 ming-dashboard 是平级目录）
const PROMPT_PATH = path.join(process.cwd(), '..', 'GptService', 'prompt.md');

// 读取 PDF 文件内容
async function readPdfContent(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`读取 PDF 失败: ${filePath}`, error);
    return '';
  }
}

// 读取文本文件
function readTextFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`读取文本文件失败: ${filePath}`, error);
    return '';
  }
}

// 获取文件夹下所有 PDF 文件
function getPdfFiles(dirPath: string): string[] {
  try {
    const files = fs.readdirSync(dirPath);
    return files.filter(file => file.toLowerCase().endsWith('.pdf'));
  } catch (error) {
    console.error(`读取目录失败: ${dirPath}`, error);
    return [];
  }
}

// 调用 DeepSeek API
async function callDeepSeek(prompt: string, trademarkData: string): Promise<string> {
  try {
    const fullPrompt = prompt.replace('{在这里插入预处理后的商标数据}', trademarkData);
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 请求失败: ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    throw error;
  }
}

// 写入分析结果
function writeAnalysisResult(dirPath: string, content: string): boolean {
  try {
    const filePath = path.join(dirPath, '价值分析和成交策略评估.txt');
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`写入分析结果失败: ${dirPath}`, error);
    return false;
  }
}

// POST 请求处理
export async function POST(request: NextRequest) {
  try {
    const { tmName } = await request.json();

    // 如果指定了商标名称，只处理该商标
    if (tmName) {
      return await analyzeSingleTrademark(tmName);
    }

    // 否则处理所有商标
    return await analyzeAllTrademarks();
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 分析单个商标
async function analyzeSingleTrademark(tmName: string) {
  console.log('=== 开始分析商标 ===');
  console.log('商标名称:', tmName);
  console.log('RESULT_DIR:', RESULT_DIR);
  
  const tmDir = path.join(RESULT_DIR, tmName);
  console.log('商标目录:', tmDir);

  // 检查目录是否存在
  if (!fs.existsSync(tmDir)) {
    console.error('目录不存在:', tmDir);
    return NextResponse.json(
      { success: false, error: `商标目录不存在: ${tmName}` },
      { status: 404 }
    );
  }

  try {
    console.log('目录存在，开始读取文件...');
    // 读取商标信息.txt
    const infoFile = path.join(tmDir, '商标信息.txt');
    console.log('商标信息文件路径:', infoFile);
    let trademarkInfo = '';
    if (fs.existsSync(infoFile)) {
      console.log('商标信息文件存在，开始读取...');
      trademarkInfo = readTextFile(infoFile);
      console.log('商标信息长度:', trademarkInfo.length);
    } else {
      console.log('商标信息文件不存在');
    }

    // 读取所有 PDF 文件内容
    const pdfFiles = getPdfFiles(tmDir);
    let pdfContents = '';
    
    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(tmDir, pdfFile);
      const pdfText = await readPdfContent(pdfPath);
      if (pdfText) {
        pdfContents += `\n\n=== ${pdfFile} ===\n${pdfText}`;
      }
    }

    // 组合数据
    const combinedData = `
商标基础信息：
${trademarkInfo}

法律文书内容：
${pdfContents}
    `.trim();

    // 读取 prompt 模板
    console.log('Prompt 文件路径:', PROMPT_PATH);
    let prompt = '';
    if (fs.existsSync(PROMPT_PATH)) {
      console.log('Prompt 文件存在，开始读取...');
      prompt = readTextFile(PROMPT_PATH);
      console.log('Prompt 长度:', prompt.length);
    } else {
      console.error('Prompt 文件不存在:', PROMPT_PATH);
      return NextResponse.json(
        { success: false, error: `Prompt 模板文件不存在: ${PROMPT_PATH}` },
        { status: 500 }
      );
    }

    console.log('组合数据长度:', combinedData.length);
    console.log('开始调用 DeepSeek API...');
    console.log('API Key 长度:', DEEPSEEK_API_KEY.length);
    
    // 调用 DeepSeek API
    const analysisResult = await callDeepSeek(prompt, combinedData);
    console.log('DeepSeek API 返回结果长度:', analysisResult.length);

    // 写入分析结果
    const writeSuccess = writeAnalysisResult(tmDir, analysisResult);

    if (writeSuccess) {
      return NextResponse.json({
        success: true,
        message: `商标 ${tmName} 分析完成`,
        tmName
      });
    } else {
      return NextResponse.json(
        { success: false, error: '写入分析结果失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`分析商标 ${tmName} 失败:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '分析失败' },
      { status: 500 }
    );
  }
}

// 分析所有商标
async function analyzeAllTrademarks() {
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

    const results = {
      total: dirs.length,
      success: 0,
      failed: 0,
      details: [] as any[]
    };

    // 读取 prompt 模板
    let prompt = '';
    if (fs.existsSync(PROMPT_PATH)) {
      prompt = readTextFile(PROMPT_PATH);
    } else {
      return NextResponse.json(
        { success: false, error: 'Prompt 模板文件不存在' },
        { status: 500 }
      );
    }

    // 逐个处理每个商标
    for (const tmName of dirs) {
      try {
        const tmDir = path.join(RESULT_DIR, tmName);

        // 读取商标信息.txt
        const infoFile = path.join(tmDir, '商标信息.txt');
        let trademarkInfo = '';
        if (fs.existsSync(infoFile)) {
          trademarkInfo = readTextFile(infoFile);
        }

        // 读取所有 PDF 文件内容
        const pdfFiles = getPdfFiles(tmDir);
        let pdfContents = '';
        
        for (const pdfFile of pdfFiles) {
          const pdfPath = path.join(tmDir, pdfFile);
          const pdfText = await readPdfContent(pdfPath);
          if (pdfText) {
            pdfContents += `\n\n=== ${pdfFile} ===\n${pdfText}`;
          }
        }

        // 组合数据
        const combinedData = `
商标基础信息：
${trademarkInfo}

法律文书内容：
${pdfContents}
        `.trim();

        // 调用 DeepSeek API
        const analysisResult = await callDeepSeek(prompt, combinedData);

        // 写入分析结果
        const writeSuccess = writeAnalysisResult(tmDir, analysisResult);

        if (writeSuccess) {
          results.success++;
          results.details.push({ tmName, status: 'success' });
        } else {
          results.failed++;
          results.details.push({ tmName, status: 'failed', error: '写入失败' });
        }

        // 延迟 2 秒，避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.failed++;
        results.details.push({
          tmName,
          status: 'failed',
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('批量分析失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '批量分析失败' },
      { status: 500 }
    );
  }
}

