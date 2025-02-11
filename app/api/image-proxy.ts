import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 获取图片 URL
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing image URL' });
    }

    console.log('Fetching image from:', imageUrl);

    // 发起请求获取图片数据
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': 'https://www.biaoyuan.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.97 Safari/537.36 Core/1.116.475.400 QQBrowser/13.5.6267.400',
      },
    });

    console.log('Response status:', response.status);

    // 设置响应头
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存一年
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域

    // 返回图片数据
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}