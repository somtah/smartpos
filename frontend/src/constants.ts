import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Signature Burger',
    price: 18.50,
    category: 'Main Course',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUGs-EPRuAK903JKHefskT2la_3AO0nktDyKXdRqbD-83sEbYziIveMljxjue3rfmT79B1BseL7yanyzXutZa7HcMp4lRJsAlFnO-rCSeMBd6-njA80Scp1oj5-Df6BFnXG9rJQ3vQ4KlKNva4W9ZScyiyqnaax-8DyUC5KVNlJn6hopUWanbAxTPKNRQvC3qmzLY9omENQpSG9OVbNNng2kAKG_3CDDJl554rlQDkVHtrVSJopm0Ci9bGXyCbyJBDKOkMjntklcI',
    stockStatus: 'In Stock',
    stockCount: 156,
    sku: 'FD-BP-0012',
    description: 'Medium Rare, Add Avocado'
  },
  {
    id: '2',
    name: 'Classic Negroni',
    price: 14.00,
    category: 'Drinks',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJBCU1ynZr6X5SZAjP8WL8yJJvgFIf1URa9ItE1GKmaMcMgo4E7h4-z5F660UttRujhOFuBUtAAQdHk-zcSh-L56ldT5pOtSHQbxJrzRu2OHzQ-enVfZdCZn2HH0bRkylUqeTD-jA4sKawR9Dh44ewp3U2pg8sSVPCVvAxX5RuDRobqgBZB4XRFJKfFNtBqHns0IuMRJIlckv3xXLinepBNekQqrizhjVSt-i7WUyODT1JOEFVKW_hVbFIuStOqhgpSJM7DdYBwww',
    stockStatus: 'In Stock',
    stockCount: 42,
    sku: 'CK-MJ-1000'
  },
  {
    id: '3',
    name: 'Retail Tote Bag',
    price: 35.00,
    category: 'Retail',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-0N0myE52bypwHwIz2Gqk8WvuK7ewUdLrF-6DfV1_9AJcnCVQIEVqOq7HchSfXHUCSNk5ZhMO856jZVDPe0lcuYKqeC2nFyTQ6q8mmZAuJ2zw4Yd4SS5QMFeFDanqv0UyQ841u56YzawR_EnYNiEdqm_PfCGw8xFbvv8-jCDitk48plbh9Ch6A33Sbbh9s8X5yRYCMGNVJkV8CqJ3UqTZ_I56m940V1K35MXokAlq2WxFs6pijwX-pCVXuIjF-npe3ysvwc0yxTk',
    stockStatus: 'Low Stock',
    stockCount: 12,
    sku: 'RT-TB-2024'
  },
  {
    id: '4',
    name: 'Truffle Fries',
    price: 9.50,
    category: 'Sides',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKsVHDi9J3INsctgMTmy6HnScusRVtvi1lUwvuMN2lOYnOu8_Y1IO0watXquZXeF-4Lw5ubcgN0k9oiK-jeeChroM3VI3m32Gx3ciXiO5te9MH2cgaonYWeXhCjXg_Oe7QRNEmKD8G4kkMHhXH5mKVBKUNy5y0-xnYsaACZFKSZg5pp0WykLbKj4oz-dPnjWWyaIlA-hsZR6-ls4azvdGZiJk1es9jw-0_8mYcutq--HeULVHiHO_fJSRjNnOul3rpO9Hh0V8opPc',
    stockStatus: 'In Stock',
    stockCount: 88,
    sku: 'FD-SD-0044'
  },
  {
    id: '5',
    name: 'Glazed Donut',
    price: 4.50,
    category: 'Bakery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-AfrOkfkLo7szYYexbaHyP49Pw2LK8g4-xvXIuDxClfUBbszfsZ57rRN3UktbG1-i0fjQZSzyVkpkwdT3YM5crhMG73Huit9OaJR67X1SThc2xoxL-P3dOB2osLz5EOoeyRVEs6QireN-m1cnwqG2OcAf8qvRsho2ur6tlVidZPTX4C0J7bYRFBlTfLuUlZEfv3lhClB8NmhQD46TJohwMKuYW67NRL-MSRZIo4aVnGrCfw2EIjblJYXJhkuiCZ2lbo05tWtekAY',
    stockStatus: 'In Stock',
    stockCount: 22,
    sku: 'BK-DN-0001'
  },
  {
    id: '6',
    name: 'Iced Latte',
    price: 5.25,
    category: 'Drinks',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7BNdQwxM75D81w-f_5JcE7WzxCtyQDpOamYEubRJI9ZHc6twini_2f151N6IJu9Vd6yzbG-uG7YrB4sI2CTyCRCdCdQBo0RSy1FbDrBNYzyCvBhSXHdLXhptbZ-MvpQsbnP_REqMXQYhICvpGoLTkgcz9aSiY5gHetkaJETXSYz0Mx1pF4Uj1zM1-zCvs3bfel569Z5g_x8fBmpgf_2dY1aN2NRz6fJvNW-DRVjvwIk8and-wuhP-8-B46aiY5_0aGxb2BRU_O6w',
    stockStatus: 'In Stock',
    stockCount: 65,
    sku: 'CK-LT-0022'
  },
  {
    id: '7',
    name: 'Classic Margherita',
    price: 16.00,
    category: 'Main Course',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_RKRxzu9kyOD6cfbrTE_MN4p0nh9pCYtQ1w3h5B9YBsEZVy_jpeSfzHcg1dBu_pMvX6WRaL3YMRj-D33IVwpF_RsJ4GVGpDjtwvSbjvGUta0M1ud8NTxdGWzjPG3lwG_o2mcbp9GPtM8JI_HPN0cEzHGBXr5VHqPnHXzlJ1Pp2lSkeVIwu6LeabbT-_k_OfbZwS6_l-CTRBl0WsWejAx1uVgN-sC9fENS0AqfPMhXkPnv_ZPlE7OSlUBAze5vqRNj7vPv_eXQADw',
    stockStatus: 'In Stock',
    stockCount: 18,
    sku: 'FD-PZ-0001'
  },
  {
    id: '8',
    name: 'Fudge Brownie',
    price: 6.50,
    category: 'Bakery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClE3_sJFdAkKdAU4vhm94WIChL8dOoeVtXU3H0dlTezS0F8E17jtF7joz24rcPQAd08oraBV1S0qsaaemM3DvDGWLK8BFsdkeYynSwgII-l7z0jwwr40pPckb8diwT7-dVM3CgimqMJvgnQAddUPjzn7RLWL2mzqTcGWUvdTvxeWTuy0Jsfx-H-o5eZ-RVoipoy_5WxfGyGOiC-7PkM9nOe9hK0TF2AeleOk3ouXodA_03qtb8yEqM3Dq5uYLIDNm3pOr4Jw8Z_cE',
    stockStatus: 'In Stock',
    stockCount: 34,
    sku: 'BK-BR-0005'
  },
  {
    id: '9',
    name: 'Estate Reserve Cabernet',
    price: 45.00,
    category: 'Spirits',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLokCgQQjKyHzjdf3p3fcLSpH1mxc_QJVI7_TpI3udgdhiZXYBZy1q_uP1hou9O_-NBCIkqOm50ufoWAOBwP_e3s5cQrL3_NgmQuiaRNaSso2V-iW677Gcu5aaYGaYlPfZwDDgTuZYyxG48Jfzbf2_FaL9xoBle56WKP3ZuMnZlAi_f1UqMAokPNLrVDQ5JP8E8kl8q0w-VO3QPgEFSz2PWofzDgNRpd1Mbq46IDv1m3eLCj3hR72gsMrf55fICl4rTfaQDnq0y3o',
    stockStatus: 'Low Stock',
    stockCount: 4,
    sku: 'WN-ES-2023-R'
  },
  {
    id: '10',
    name: 'Single Origin Roast',
    price: 24.50,
    category: 'Coffee',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz2sC2w1TygDFVLr35Jhp-TLsPW9XgYuUl1WWtaG6deCIv-_Cbr6RP-KWYWvisgNGzcdzIamriAENxxCVL8wki5U2MwXUm7PrFzSXPVT_9rwxMEP1jG5RvEb-2WquDAG3kKu0LGwOVXz45IhM72UVtcTSSPY6Bfm-DuFm1gEHB2tU-lqSDl19mh7mOt5pa9oIUxYLZIO-ChoCdygub723XCxRNc86g9uK3gmxGSzKomc5BXiC_yiMzSap0t6O7th3xUEpO3NqZXsM',
    stockStatus: 'Out of Stock',
    stockCount: 0,
    sku: 'CF-SO-BL-01'
  }
];

export const STAFF = {
  name: 'Michael Chen',
  role: 'Station Manager',
  profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGdf9Zt8HJoQns0hj89PknXqaPUK3M9LRkyHQvySnKWNd9zEJFfy2cCvrYcUcTuRTmIxGZfYHRdVYF4IloSPqjNvOe_fmJoAlsmtXqI9JXLWuUXSJvAWWs9RQ4h2h3uWj0HBUw-TplLKt3O_C3qOkyc5-f3rMHATdA3t4HHDWr_yNKCGtPIqWSbUpgVAkSy9oeP2MYYoYAuF3WeEU53VNTDSIf6XYq9iKJ8vQ8ezL7yRrwPoXifNy7NckceZ4z5Pb3jVjSeUswEGU',
  station: 'Station 04'
};
