import axios from 'axios';

// 转义CSV中的逗号
const escapeCommas = (str: string | undefined): string => {
  if (!str) return '';
  return str.toString().replace(/,/g, '，');
};
    
export const exportToCSV = async (username: string, config: any, data: any) => {
  let headers: string[] = [];
  let csvData: string = '';
  let name = '';
  let index = config.id;
  if(index === 7) {
    name = '驳回申请潜在客户数据';
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
  
    csvData = [
      headers.join(','),
      ...data.map((product: any) => [
        product.applicantCn,
        product.operName,
        escapeCommas(product.contactPhone),
        escapeCommas(product.contactEmail),
        product.address,
        product.tmName,
        product.intCls,
        product.regNo,
        product.statusName,
        product.appDate,
        product.rescindDate,
        product.rejectDate,
        product.agent
      ].join(','))
    ].join('\r\n');
  }

  if(index === 8) {
    name = '无效答辩潜在客户数据';
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
      '无效申请收文',
      '无效受通发文',
      '代理机构'
    ];

    csvData = [
      headers.join(','),
      ...data.map((product: any) => [
        product.applicantCn,
        product.operName,
        escapeCommas(product.contactPhone),
        escapeCommas(product.contactEmail),
        product.address,
        product.tmName,
        product.intCls,
        product.regNo,
        product.statusName,
        product.acceptDate,
        product.rescindDate,
        product.agent
      ].join(','))
    ].join('\r\n');
  }

  if(index === 9) {
    name = '撤三答辩潜在客户数据';
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
      '无效申请收文',
      '无效受通发文',
      '代理机构'
    ];

    csvData = [
      headers.join(','),
      ...data.map((product: any) => [
        product.applicantCn,
        product.operName,
        escapeCommas(product.contactPhone),
        escapeCommas(product.contactEmail),
        product.address,
        product.tmName,
        product.intCls,
        product.regNo,
        product.statusName,
        product.acceptDate,
        product.rescindDate,
        product.agent
      ].join(','))
    ].join('\r\n');
  }

  if(index === 11) {
    name = '等待续展潜在客户数据';
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
      '注册日期',
      '到期日期',
      '代理机构'
    ];

    csvData = [
      headers.join(','),
      ...data.map((product: any) => [
        product.applicant_cn || product.applicantCn || '',
        product.oper_name || product.operName || '',
        escapeCommas(product.contact_phone || product.contactPhone || ''),
        escapeCommas(product.contact_email || product.contactEmail || ''),
        product.address_cn || product.addressCn || product.address || '',
        product.tm_name || product.tmName || '',
        product.int_cls || product.intCls || '',
        product.reg_no || product.regNo || '',
        product.status_name || product.statusName || '',
        product.app_date || product.appDate || '',
        product.reg_date || product.regDate || '',
        product.expire_date || product.expireDate || '',
        product.agent || ''
      ].join(','))
    ].join('\r\n');
  }

  await axios.post('https://ai.aliensoft.com.cn/api/saveRecord', {
    username,
    item: index
  });

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `${currentDate} ${name}.csv`;
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const loadData = async (startDate: string, endDate: string) => {
  if (startDate && endDate) {
    try {
      const [res7, res8, res9] = await Promise.all([
        axios.post('https://ai.aliensoft.com.cn/api/loadData7', {
          startDate,
          endDate
        }),
        axios.post('https://ai.aliensoft.com.cn/api/loadData8', {
          startDate,
          endDate
        }),
        axios.post('https://ai.aliensoft.com.cn/api/loadData9', {
          startDate,
          endDate
        })
      ]);

      return {
        data7: res7?.data?.success ? res7.data.data : [],
        data8: res8?.data?.success ? res8.data.data : [],
        data9: res9?.data?.success ? res9.data.data : [],
        success: true
      };
    } catch (error) {
      console.error('加载数据失败:', error);
      return {
        data7: [],
        data8: [],
        data9: [],
        success: false
      };
    }
  }
  
  return {
    data7: [],
    data8: [],
    data9: [],
    success: false
  };
};