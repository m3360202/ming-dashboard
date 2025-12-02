import axios from 'axios';

export interface TrademarkItem {
  contactAddress?: any;
  rejectDate?: string;
  createTime?: string;
  appDate?: string;
  add_time: string;
  applicantCn: string;
  logoUrl: string;
  tmName: string;
  statusName: string;
  acceptDate: string;
  rescindDate: string;
  agent: string;
  intCls: string;
  regNo: string;
  operName: string;
  addressCn: string;
  contactPhone: string;
  contactEmail: string;
  clueWithCustomerVo: {
    fcontactPhone: string;
    fcontactEmail: string;
  };
}

// 获取日期列表
export const getDateList = async () => {
  try {
    const res = await axios.post('https://ai.aliensoft.com.cn/api/dataList', {});
    if (res?.data?.success) {
      return res?.data?.data;
    }
    return [];
  } catch (error) {
    console.log('error', error);
    return [];
  }
};

// 获取数据 - 根据API类型调用不同接口
export const getData = async (apiType: string, params: any) => {
  try {
    const res = await axios.post(`https://ai.aliensoft.com.cn/api/${apiType}`, params);
    if (res?.data?.success) {
      return {
        success: true,
        data: res?.data?.data || [],
        total: res?.data?.total || 0
      };
    }
    return { success: false, data: [], total: 0 };
  } catch (error) {
    console.log('error', error);
    return { success: false, data: [], total: 0 };
  }
};

// 日期计算函数 - 根据不同类型计算天数
export const calculateDaysOrApply = (startDateString: string, type: string = 'default'): string => {
  if (!startDateString) return '无日期';
  
  const startDate = new Date(startDateString);
  const currentDate = new Date();
  
  if (startDate > currentDate) {
    switch(type) {
      case 'reject':
        return "驳回发文";
      case 'accept':
        return "申请收文";
      case 'rescind':
        return "撤三发文";
      default:
        return "待处理";
    }
  } else {
    const diffTime = currentDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    switch(type) {
      case 'reject':
        return `${diffDays} 天前 | 驳回发文`;
      case 'accept':
        return `${diffDays}天前 | 申请收文`;
      case 'rescind':
        return `${diffDays}天前 | 撤三发文`;
      default:
        return `${diffDays}天前`;
    }
  }
};

// CSV导出功能 - 根据不同类型导出不同格式
export const exportToCSV = async (
  data: TrademarkItem[], 
  filename: string, 
  username: string, 
  itemId: number,
  type: 'table7' | 'table8' | 'table9' = 'table7'
) => {
  if (!data || data.length === 0) {
    alert('没有数据可导出');
    return;
  }

  // 记录导出操作
  try {
    await axios.post('https://ai.aliensoft.com.cn/api/saveRecord', {
      username,
      item: itemId
    });
  } catch (error) {
    console.log('保存记录失败', error);
  }

  // 根据不同类型设置不同的表头
  let headers: string[] = [];
  
  switch(type) {
    case 'table7': // 驳回复审
      headers = [
        '申请人',
        '联系人',
        '联系电话',
        '联系邮箱',
        '申请地址',
        '商标名称',
        '类目',
        '注册号',
        '状态',
        '申请日期',
        '更新日期',
        '驳回日期',
        '代理机构'
      ];
      break;
    case 'table8': // 无效答辩
      headers = [
        '申请人',
        '联系人',
        '联系电话',
        '联系邮箱',
        '商标名称',
        '类目',
        '注册号',
        '状态',
        '申请日期',
        '代理机构'
      ];
      break;
    case 'table9': // 撤三答辩
      headers = [
        '申请人',
        '联系人',
        '联系电话',
        '联系邮箱',
        '商标名称',
        '类目',
        '注册号',
        '状态',
        '申请日期',
        '撤三日期',
        '代理机构'
      ];
      break;
  }

  // 处理逗号转义
  const escapeCommas = (field: string | undefined) => {
    if (field && field.includes(',')) {
      return `"${field.replace(/"/g, '""')}"`; 
    }
    return field || '';
  };

  // 根据类型生成CSV数据
  const csvData = [
    headers.join(','),
    ...data.map(product => {
      switch(type) {
        case 'table7':
          return [
            product.applicantCn,
            product.operName,
            escapeCommas(product.contactPhone),
            escapeCommas(product.contactEmail),
            product.contactAddress,
            product.tmName,
            product.intCls,
            product.regNo,
            product.statusName,
            product.appDate,
            product.createTime,
            product.rejectDate,
            product.agent
          ].join(',');
        case 'table8':
          return [
            product.applicantCn,
            product.operName,
            escapeCommas(product.contactPhone),
            escapeCommas(product.contactEmail),
            product.tmName,
            product.intCls,
            product.regNo,
            product.statusName,
            product.acceptDate,
            product.agent
          ].join(',');
        case 'table9':
          return [
            product.applicantCn,
            product.operName,
            escapeCommas(product.contactPhone),
            escapeCommas(product.contactEmail),
            product.tmName,
            product.intCls,
            product.regNo,
            product.statusName,
            product.acceptDate,
            product.rescindDate,
            product.agent
          ].join(',');
        default:
          return '';
      }
    })
  ].join('\r\n');

  // 创建并下载文件
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// 按钮配置
export const buttonConfigs = [
  { 
    id: 7, 
    name: '驳回复审', 
    api: 'loadData7', 
    color: '#f30000', 
    description: '经过AI比对，正在驳回的快照，的潜在用户将会被列出在这里',
    type: 'table7' as const,
    dateType: 'reject'
  },
  { 
    id: 8, 
    name: '无效答辩', 
    api: 'loadData8', 
    color: '#fa9d3b', 
    description: '经过AI比对，无效答辩风险大于60分，的潜在用户将会被列出在这里',
    type: 'table8' as const,
    dateType: 'accept'
  },
  { 
    id: 9, 
    name: '撤三答辩', 
    api: 'loadData9', 
    color: '#6f67f0', 
    description: '经过AI比对，撤三答辩风险大于60分，的潜在用户将会被列出在这里',
    type: 'table9' as const,
    dateType: 'rescind'
  },
  { 
    id: 11, 
    name: '等待续展', 
    api: 'loadData11', 
    color: '#07c160', 
    description: '等待续展的商标数据',
    type: 'table11' as const,
    dateType: 'accept'
  },
  { 
    id: 12, 
    name: '专利申请需求', 
    api: 'loadData11', 
    color: '#07c160', 
    description: '等待注册的商标数据',
    type: 'table9' as const,
    dateType: 'accept'
  },
  { 
    id: 17, 
    name: '企业信用证书需求', 
    api: 'getData7List', 
    color: '#ff6b6b', 
    description: '驳回复审的历史数据列表',
    type: 'table7' as const,
    dateType: 'reject'
  },
  // { 
  //   id: 18, 
  //   name: '无效历史数据', 
  //   api: 'getData8List', 
  //   color: '#ffa726', 
  //   description: '无效答辩的历史数据列表',
  //   type: 'table8' as const,
  //   dateType: 'accept'
  // },
  // { 
  //   id: 19, 
  //   name: '撤三历史数据', 
  //   api: 'getData9List', 
  //   color: '#ab47bc', 
  //   description: '撤三答辩的历史数据列表',
  //   type: 'table9' as const,
  //   dateType: 'rescind'
  // },
  // { 
  //   id: 20, 
  //   name: '综合风险评估', 
  //   api: 'loadData7', 
  //   color: '#26a69a', 
  //   description: '综合多种风险因素的评估数据',
  //   type: 'table7' as const,
  //   dateType: 'reject'
  // },
  // { 
  //   id: 21, 
  //   name: '高风险商标', 
  //   api: 'loadData8', 
  //   color: '#ef5350', 
  //   description: '高风险商标的预警数据',
  //   type: 'table8' as const,
  //   dateType: 'accept'
  // },
  // { 
  //   id: 22, 
  //   name: '待处理事项', 
  //   api: 'loadData9', 
  //   color: '#42a5f5', 
  //   description: '需要及时处理的商标事项',
  //   type: 'table9' as const,
  //   dateType: 'rescind'
  // }
]; 