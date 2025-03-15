import * as pdfjsLib from 'pdfjs-dist';
import * as fabric from 'fabric';
import { PDFDocument } from 'pdf-lib';
import { uploadFile } from '@/utils/upload';

// 设置 PDF.js Worker 路径
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface AddImageToPDFOptions {
  pdfUrl: string;
  imageUrl: string;
  position: { x: number; y: number };
}

export const addImageToPDF = async ({ pdfUrl, imageUrl, position }: AddImageToPDFOptions): Promise<any> => {
  // 创建一个临时的 canvas 元素
  const canvas = document.createElement('canvas');
  const fabricCanvas = new fabric.Canvas(canvas, {
    width: 750,
    height: 0,
    backgroundColor: '#fff',
  });
  console.log('---------------------pdfpdf',pdfUrl)
  // 加载 PDF 并渲染所有页面
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  console.log('----------pdf',pdf)
  const numPages = pdf.numPages;
  let totalHeight = 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d')!;
    canvasElement.height = viewport.height;
    canvasElement.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    const pdfImage = new fabric.Image(canvasElement, {
      left: 0,
      top: totalHeight,
      selectable: false,
      scaleX: fabricCanvas.width / canvasElement.width,
      scaleY: fabricCanvas.width / canvasElement.width,
    });

    fabricCanvas.add(pdfImage);
    totalHeight += viewport.height * (fabricCanvas.width / canvasElement.width);
  }

  fabricCanvas.setHeight(totalHeight);
  fabricCanvas.calcOffset();
  fabricCanvas.renderAll();

  // 添加图片
  const imgElement = new Image();
  imgElement.src = imageUrl;

  await new Promise((resolve, reject) => {
    imgElement.onload = () => {
      const img = new fabric.Image(imgElement, {
        left: position.x,
        top: position.y,
        selectable: true,
      });

      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      resolve(null);
    };

    imgElement.onerror = (error) => {
      reject(error);
    };
  });

  // 生成 PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([750, fabricCanvas.getHeight()]);
  //@ts-ignore
  const imageUrlData = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
  });

  const pngImage = await pdfDoc.embedPng(imageUrlData);
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: 750,
    height: fabricCanvas.getHeight(),
  });

  const pdfBytes = await pdfDoc.save();
  const file =  new File([pdfBytes], 'temp.pdf', { type: 'application/pdf' });
  const result = await uploadFile(file);
  return result;
};
