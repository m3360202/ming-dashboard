'use client'
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as fabric from 'fabric';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import Zhang from '@/images/testzhang.png';

// 设置 PDF.js Worker 路径
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const ContractPreview = ({ pdfUrl }: { pdfUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // 父容器引用
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [scrollTop, setScrollTop] = useState(0); // 当前滚动高度
  let canvas: any;
  useEffect(() => {
    if (!canvasRef.current) return;
    if (pdfUrl) {
      // 初始化 Fabric.js 画布
      canvas = new fabric.Canvas(canvasRef.current, {
        width: 750, // 固定宽度
        height: 0, // 初始高度为 0，动态调整
        backgroundColor: '#fff',
      });
      setFabricCanvas(canvas);

      // 加载 PDF 并渲染所有页面
      const loadPDF = async () => {
        const loadingTask = pdfjsLib.getDocument('https://hypergpt.oss-ap-southeast-1.aliyuncs.com/' + pdfUrl);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages; // 获取总页数

        let totalHeight = 0; // 所有页面的总高度

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvasElement = document.createElement('canvas');
          const context = canvasElement.getContext('2d')!;
          canvasElement.height = viewport.height;
          canvasElement.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;

          // 将每一页转换为 Fabric.js 的 Image 对象
          const pdfImage = new fabric.Image(canvasElement, {
            left: 0,
            top: totalHeight, // 设置每一页的垂直位置
            selectable: false, // 禁止选中
            scaleX: canvas.width / canvasElement.width,
            scaleY: canvas.width / canvasElement.width, // 保持宽高比一致
          });

          // 将每一页添加到画布
          canvas.add(pdfImage);

          // 更新总高度
          totalHeight += viewport.height * (canvas.width / canvasElement.width);
        }

        // 动态调整画布高度
        console.log('totalHeight:', totalHeight);
        canvas.setHeight(totalHeight);
        canvas.calcOffset(); // 重新计算画布偏移量
        canvas.renderAll();
      };

      loadPDF();

    }

    // 监听父容器的滚动事件
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
    }
    // 监听键盘事件
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        
        const activeObject = canvas.getActiveObject(); // 获取当前选中的对象
        if (activeObject) {
          canvas.remove(activeObject); // 删除选中的对象
          canvas.renderAll(); // 重新渲染画布
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      if (canvas) {
        canvas.dispose(); // 清理画布
      }

      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('keydown', handleKeyDown); // 移除键盘事件监听
    };
  }, [pdfUrl]);

  // 添加本地图片（合同章）
  const addStamp = () => {
    if (!fabricCanvas) return;

    const imgElement = new Image();
    imgElement.src = Zhang.src; // 设置图片路径

    imgElement.onload = () => {
      const img = new fabric.Image(imgElement, {
        left: 100, // 设置图片的 X 坐标
        top: scrollTop + 100, // 根据滚动高度设置图片的 Y 坐标
        scaleX: 0.5, // 设置图片的宽度缩放比例
        scaleY: 0.5, // 设置图片的高度缩放比例
        selectable: true, // 允许选中
      });

      fabricCanvas.add(img);
      fabricCanvas.renderAll();
    };

    imgElement.onerror = (error) => {
      console.error('图片加载失败:', error);
    };
  };

  // 生成 PDF
  const generatePDF = async () => {
    if (!fabricCanvas) return;

    // 将画布内容导出为图片
    //@ts-ignore
    const imageUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
    });

    // 创建 PDF 文档
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([750, fabricCanvas.getHeight()]); // 根据画布高度设置页面高度

    // 将图片嵌入 PDF
    const pngImage = await pdfDoc.embedPng(imageUrl);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 750,
      height: fabricCanvas.getHeight(),
    });

    // 保存并下载 PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'contract.pdf';
    link.click();
  };

  return (
    <div>
      {/* 父容器，支持滚动 */}
      <div
        ref={containerRef}
        style={{ border: '#ccc 2px solid', boxShadow: 'inherit', height: '600px', overflow: 'auto' }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button onClick={addStamp}>加盖合同章</Button>
        <Button onClick={addStamp}>加盖骑缝章</Button>
        <Button onClick={generatePDF}>保存为 PDF</Button>
      </div>
    </div>
  );
};

export default ContractPreview;
