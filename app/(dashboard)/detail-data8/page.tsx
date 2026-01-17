'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { File, Download, AlertCircle, Brain } from 'lucide-react';

export default function ItemsTable() {
  const productsPerPage = 100;
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [dateValue, setDateValue] = useState('');

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 获取列表数据
  const getListData = async (date: string) => {
    try {
      setCurrentStatus(`正在获取日期 ${date} 的列表数据...`);
      const res = await axios.post('https://ai.aliensoft.com.cn/api/loadData8', {
        startDate: date,
        endDate: date
      });

      if (res?.data?.success && res?.data?.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        console.log(`日期 ${date} 数据获取成功，共 ${list.length} 条记录`);
        return list;
      } else {
        console.error('获取列表数据失败:', res?.data);
        return [];
      }
    } catch (error) {
      console.error('获取列表数据错误:', error);
      return [];
    }
  };

  // 获取商标详情数据
  const getMarkDetail = async (detailId: string, tmName: string) => {
    try {
      setCurrentStatus(`正在获取商标详情: ${tmName}`);

      const res = await axios.post('http://localhost:8080/requestMarkDetail', {
        detailId: detailId
      });

      if (res?.data?.data) {
        return res.data.data;
      } else {
        console.error('获取商标详情失败:', res?.data);
        return null;
      }
    } catch (error) {
      console.error('获取商标详情错误:', error);
      return null;
    }
  };

  // 保存文件到后端
  const saveFileToBackend = async (tmName: string, content: string, fileType: 'doc' | 'pdf' | 'image', pdfData?: any) => {
    try {
      const res = await axios.post('http://localhost:8080/saveTrademarkData', {
        tmName: tmName,
        data: fileType === 'doc' ? content : pdfData,
        fileType: fileType
      });

      if (res?.data?.success) {
        console.log(`文件保存成功: ${tmName}`);
        return true;
      } else {
        console.error('文件保存失败:', res?.data);
        return false;
      }
    } catch (error) {
      console.error('保存文件错误:', error);
      return false;
    }
  };

  // 分析商标数据（使用 DeepSeek）
  const analyzeTrademarkData = async (tmName: string) => {
    try {
      setAnalysisStatus(`正在分析商标: ${tmName}`);
      const res = await axios.post('/api/analyze-trademark', {
        tmName: tmName
      });

      if (res?.data?.success) {
        setAnalysisStatus(`分析完成: ${tmName}`);
        console.log(`商标分析成功: ${tmName}`);
        return true;
      } else {
        setAnalysisStatus(`分析失败: ${tmName} - ${res?.data?.error || '未知错误'}`);
        console.error('商标分析失败:', res?.data);
        return false;
      }
    } catch (error) {
      setAnalysisStatus(`分析错误: ${tmName}`);
      console.error('商标分析错误:', error);
      return false;
    }
  };

  // 处理单个商户数据
  const processSingleMerchant = async (merchant: any, detailData: any) => {
    try {
      console.log('开始处理商户:', merchant.tmName);

      if (!detailData) {
        setErrorCount(prev => prev + 1);
        return false;
      }

      // 提取核心有用属性（根据实际API返回的数据结构）
      const coreAttributes = {
        tmName: detailData.brand?.name || merchant.tmName || '未知',
        intCls: detailData.brand?.typeCode || merchant.intCls || '未知',
        applicantCn: detailData.brand?.applicant || merchant.applicantCn || '未知',
        address: detailData.brand?.address || merchant.address || '未知',
        appDate: detailData.brand?.appDate || merchant.appDate || '未知',
        agent: detailData.brand?.agency || merchant.agent || '未知',
        statusName: detailData.brand?.processName || merchant.statusName || '未知',
        acceptDate: merchant.acceptDate || '未知', // 从list数据中获取
        acceptDays: merchant.acceptDays || '未知', // 从list数据中获取
        privateDateStart: detailData.brand?.privateStartDate || merchant.privateDateStart || '未知',
        privateDateEnd: detailData.brand?.privateEndDate || merchant.privateDateEnd || '未知',
        province: detailData.brand?.province || merchant.province || '未知',
        city: detailData.brand?.city || merchant.city || '未知',
        logoUrl: detailData.brand?.tmLogoUrl || merchant.logoUrl || '无',
        goods: detailData.goodsList || merchant.goods || [],
        noticeList: detailData.noticeList || [],
        reviewList: detailData.reviewList || [],
        flowList: detailData.flowList || [],
        contactPhone: merchant.contactPhone || '',
        email: merchant.contactEmail || ''
      };

      // 生成商标信息文档
      const docContent = generateDocContent(coreAttributes);

      // 保存商标信息文档
      await saveFileToBackend(merchant.tmName, docContent, 'doc');

      // 下载商标图片
      if (detailData.brand?.tmLogoUrl) {
        await saveFileToBackend(merchant.tmName, '', 'image', {
          url: detailData.brand.tmLogoUrl
        });
      }

      // 下载公告PDF文件
      if (detailData.noticeList && Array.isArray(detailData.noticeList)) {
        for (const notice of detailData.noticeList) {
          await saveFileToBackend(merchant.tmName, '', 'pdf', {
            fileName: `${notice.noticeName}_${notice.issue}.pdf`,
            url: notice.noticeUrl
          });
        }
      }

      // 下载评审文书PDF文件
      if (detailData.reviewList && Array.isArray(detailData.reviewList)) {
        for (const review of detailData.reviewList) {
          await saveFileToBackend(merchant.tmName, '', 'pdf', {
            fileName: `${review.reviewName}.pdf`,
            url: review.tmReviewUrl
          });
        }
      }

      setProcessedCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error(`处理商户 ${merchant.tmName} 失败:`, error);
      setErrorCount(prev => prev + 1);
      return false;
    }
  };

  // 生成文档内容
  const generateDocContent = (coreAttributes: any) => {
    const goodsText = coreAttributes.goods && Array.isArray(coreAttributes.goods)
      ? coreAttributes.goods.map((item: any) => `  ${item.code} - ${item.name} (状态: ${item.status})`).join('\n')
      : '无';

    const noticeText = coreAttributes.noticeList && Array.isArray(coreAttributes.noticeList)
      ? coreAttributes.noticeList.map((notice: any) => `  ${notice.noticeName} - ${notice.issue}期 - ${notice.noticeDate}`).join('\n')
      : '无';

    const reviewText = coreAttributes.reviewList && Array.isArray(coreAttributes.reviewList)
      ? coreAttributes.reviewList.map((review: any) => `  ${review.reviewName} - ${review.reviewDate}`).join('\n')
      : '无';

    const flowText = coreAttributes.flowList && Array.isArray(coreAttributes.flowList)
      ? coreAttributes.flowList.map((flow: any) => `  ${flow.name || '未知流程'} - ${flow.lastTime || '未知日期'}`).join('\n')
      : '无';

    return `商标名称: ${coreAttributes.tmName}
            商标类别: ${coreAttributes.intCls}
            申请人: ${coreAttributes.applicantCn}
            地址: ${coreAttributes.address}
            申请日期: ${coreAttributes.appDate}
            代理机构: ${coreAttributes.agent}
            当前状态: ${coreAttributes.statusName}
            受理日期: ${coreAttributes.acceptDate}
            已过去天数: ${coreAttributes.acceptDays}
            专用权期限: ${coreAttributes.privateDateStart} 至 ${coreAttributes.privateDateEnd}
            所在地区: ${coreAttributes.province} ${coreAttributes.city}

            联系电话: ${coreAttributes.contactPhone}
            邮箱： ${coreAttributes.email}

            商品/服务项目:
            ${goodsText}

            商标公告:
            ${noticeText}

            评审文书:
            ${reviewText}

            流程列表:
            ${flowText}`;
  };

  // 开始分析所有商标（10个并发执行）
  const startAnalyzing = async () => {
    setIsAnalyzing(true);
    setAnalysisStatus('开始分析商标数据...');
    setProcessedCount(0);
    setErrorCount(0);

    try {
      // 先获取所有商标文件夹列表
      setAnalysisStatus('正在读取商标文件夹列表...');
      
      const listRes = await axios.get('/api/get-trademarks');
      
      if (!listRes?.data?.success) {
        setAnalysisStatus('获取商标列表失败');
        return;
      }

      const trademarks = listRes.data.trademarks;
      const total = trademarks.length;
      const concurrency = 20; // 并发数量
      
      setAnalysisStatus(`找到 ${total} 个商标，开始并发分析（每次 ${concurrency} 个）...`);

      // 分批并发处理
      for (let i = 0; i < trademarks.length; i += concurrency) {
        const batch = trademarks.slice(i, i + concurrency);
        const batchNum = Math.floor(i / concurrency) + 1;
        const totalBatches = Math.ceil(trademarks.length / concurrency);
        
        setAnalysisStatus(`正在分析第 ${batchNum}/${totalBatches} 批（${batch.length} 个商标）...`);

        // 并发执行当前批次
        const promises = batch.map(async (tmName: string) => {
          try {
            const res = await axios.post('/api/analyze-trademark', {
              tmName: tmName
            });

            if (res?.data?.success) {
              setProcessedCount(prev => prev + 1);
              console.log(`✅ ${tmName} 分析完成`);
              return { success: true, tmName };
            } else {
              setErrorCount(prev => prev + 1);
              console.error(`❌ ${tmName} 分析失败:`, res?.data?.error);
              return { success: false, tmName, error: res?.data?.error };
            }
          } catch (error) {
            setErrorCount(prev => prev + 1);
            console.error(`❌ ${tmName} 分析错误:`, error);
            return { success: false, tmName, error };
          }
        });

        await Promise.all(promises);

        // 每批完成后短暂延迟，避免API限流
        if (i + concurrency < trademarks.length) {
          await delay(1000);
        }
      }

      setAnalysisStatus(`分析完成！总计 ${total} 个商标，成功 ${processedCount} 个，失败 ${errorCount} 个`);
    } catch (error) {
      console.error('分析过程中发生错误:', error);
      setAnalysisStatus('分析过程中发生错误');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 获取商标文件夹列表
  const getTrademarkDirectories = async () => {
    try {
      const res = await axios.post('http://localhost:8080/getTrademarkDirectories');
      if (res?.data?.success) {
        return res.data.directories;
      }
      return [];
    } catch (error) {
      console.error('获取商标文件夹列表失败:', error);
      return [];
    }
  };

  // 开始处理
  const startProcessing = async () => {
    if (!dateValue) {
      setCurrentStatus('请先输入日期');
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);
    setErrorCount(0);
    setCurrentStatus('开始处理数据...');

    try {
      // 获取指定日期的数据
      const listData = await getListData(dateValue);
      if (listData.length === 0) {
        setCurrentStatus(`日期 ${dateValue} 无数据，处理完成！`);
        setIsProcessing(false);
        return;
      }

      setCurrentStatus(`数据获取成功，共 ${listData.length} 条记录，开始处理详情数据...`);

      // 处理每个商户
      for (let i = 91; i < listData.length; i++) {
        const merchant = listData[i];
        if (!merchant.detailId) continue;

        setCurrentStatus(`正在处理第 ${i + 1}/${listData.length} 条: ${merchant.tmName}`);

        // 获取商标详情（每个detail请求间隔20秒）
        const detailData = await getMarkDetail(merchant.detailId, merchant.tmName);

        // 处理商户数据
        await processSingleMerchant(merchant, detailData);

        // 每个商户处理完后等待20秒，确保每个detail请求间隔20秒
        if (i < listData.length - 1) {
          setCurrentStatus(`等待20秒后处理下一条...`);
          await delay(20000);
        }
      }

      setCurrentStatus(`所有数据处理完成！成功: ${processedCount}, 失败: ${errorCount}`);
    } catch (error) {
      console.error('处理过程中发生错误:', error);
      setCurrentStatus('处理过程中发生错误');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-row items-center gap-2'>
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              placeholder="选择日期"
              className="h-8 w-40"
              disabled={isProcessing || isAnalyzing}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={startProcessing}
              disabled={isProcessing || isAnalyzing || !dateValue}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {isProcessing ? '正在处理...' : '开始处理无效答辩数据'}
              </span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={startAnalyzing}
              disabled={isProcessing || isAnalyzing}
            >
              <Brain className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {isAnalyzing ? '正在分析...' : '分析商标价值'}
              </span>
            </Button>
          </div>

          {currentStatus && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <AlertCircle className='h-4 w-4' />
              <span>{currentStatus}</span>
            </div>
          )}

          {analysisStatus && (
            <div className='flex items-center gap-2 text-sm text-blue-600'>
              <Brain className='h-4 w-4' />
              <span>{analysisStatus}</span>
            </div>
          )}

          {(processedCount > 0 || errorCount > 0) && (
            <div className='text-xs text-muted-foreground'>
              处理统计: 成功 {processedCount} 条, 失败 {errorCount} 条
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}