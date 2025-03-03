'use client';
import React, { useRef, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCompressorProps {
  onCompressComplete: (base64: string) => void; // 压缩完成后的回调
  image: any;
  setImage: (base64: string) => void;
}

export const ImageCompressor: React.FC<ImageCompressorProps> = ({ image, onCompressComplete, setImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null); // 用于引用文件输入

  // 处理文件上传
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      compressImage(file, onCompressComplete);
    }
  };

  // 压缩图片
  const compressImage = (file: File, callback: (base64: string) => void, quality = 0.8) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置最大宽度和高度
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        // 按比例缩放图片
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // 设置 canvas 尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制图片到 canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // 将 canvas 转换为 base64
        const base64 = canvas.toDataURL('image/jpeg', quality);

        // 检查 base64 大小
        const base64Size = (base64.length * 3) / 4 - (base64.endsWith('==') ? 2 : 1); // 计算 base64 大小（字节）
        if (base64Size > 100 * 1024 && quality > 0.1) {
          // 如果大于 100KB，递归降低质量
          compressImage(file, callback, quality * 0.8);
        } else {
          // 如果小于 100KB，返回压缩后的 base64
          callback(base64);
          setImage(base64); // 显示压缩后的图片
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // 点击按钮时触发文件选择
  const handleButtonClick = () => {
    fileInputRef.current?.click(); // 触发文件输入点击事件
  };

  return (
    <div>
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }} // 隐藏文件输入
      />
      {/* 自定义按钮 */}
      <Button size="sm" className="h-8 gap-1" onClick={handleButtonClick}>
        <PlusCircle className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">图片上传</span>
      </Button>
      
    </div>
  );
};
