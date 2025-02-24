import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNav = create(
  persist(() => ({
  navItem: ['商标目标探测','商户需求AI探测']
}),
{ name: 'nav' })
);

type User = {
  image?: String;
  username: String;
  realname?: String;
  token?: String;
  role: Number;
}

export const useUser = create(
  persist<User>(() => ({
    image: '',
    username: 'unknown',
    realname: '',
    token: '',
    role: 0
}),
{ name: 'user' })
);

export const useSearchKey = create(
  persist(() => ({
  searchParams: ''
}),
{ name: 'searchKey' })
);