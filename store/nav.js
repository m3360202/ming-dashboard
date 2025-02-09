import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNav = create(
  persist(() => ({
  navItem: ['商标目标探测','商户需求AI探测']
}),
{ name: 'nav' })
);

export const useUser = create(
  persist(() => ({
  user: {
    image: '',
    username: '',
    token: '',
    role: 'admin'
  }
}),
{ name: 'user' })
);

export const useSearchKey = create(
  persist(() => ({
  searchParams: ''
}),
{ name: 'searchKey' })
);