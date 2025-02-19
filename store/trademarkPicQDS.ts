import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义 store 的状态类型
type TrademarkCheckState = {
  cls: string[]; // 品类
  st: string; // 语言 1中文 4 英文
  sc: string; // 匹配度
  pageIndex: number;
  keyword: string;
};

export const useTrademarkCheck = create(
  persist<TrademarkCheckState>(() => ({
  cls: [],//品类
  st: '1',//语言 1中文 4 英文
  sc: '1,2,3,4,5,6,7,8,9,10', //匹配度
  pageIndex: 1,
  keyword: '',
  img: ''
}),
{ name: 'trademarkCheck' })
);
