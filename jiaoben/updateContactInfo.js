const fs = require('fs');
const path = require('path');

// 配置路径（从 jiaoben 目录指向父目录）
const BASE_DIR = path.join(__dirname, '..', 'result', '无效答辩');
const CSV_FILE = path.join(BASE_DIR, 'ai_data_8(1).csv');

/**
 * 解析 CSV 行（处理引号和逗号）
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 转义的双引号
        current += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // 添加最后一个字段
  result.push(current.trim());
  
  return result;
}

/**
 * 读取并解析 CSV 文件
 */
function readCSV() {
  try {
    const content = fs.readFileSync(CSV_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      console.error('CSV 文件为空');
      return null;
    }
    
    // 解析表头
    const headers = parseCSVLine(lines[0]);
    const tmNameIndex = headers.indexOf('tmName');
    const contactPhoneIndex = headers.indexOf('contactPhone');
    const contactEmailIndex = headers.indexOf('contactEmail');
    
    if (tmNameIndex === -1 || contactPhoneIndex === -1 || contactEmailIndex === -1) {
      console.error('CSV 文件中缺少必要的列：tmName, contactPhone, contactEmail');
      return null;
    }
    
    // 解析数据行
    const dataMap = new Map();
    
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);
      
      if (fields.length <= Math.max(tmNameIndex, contactPhoneIndex, contactEmailIndex)) {
        continue; // 跳过不完整的行
      }
      
      const tmName = fields[tmNameIndex].replace(/^"|"$/g, ''); // 移除引号
      const contactPhone = fields[contactPhoneIndex].replace(/^"|"$/g, '');
      const contactEmail = fields[contactEmailIndex].replace(/^"|"$/g, '');
      
      // 跳过空值或 "-"
      if (tmName && tmName !== 'NULL' && tmName !== '') {
        dataMap.set(tmName, {
          phone: contactPhone && contactPhone !== '-' && contactPhone !== 'NULL' ? contactPhone : null,
          email: contactEmail && contactEmail !== '-' && contactEmail !== 'NULL' ? contactEmail : null
        });
      }
    }
    
    console.log(`成功读取 CSV 文件，共 ${dataMap.size} 条记录`);
    return dataMap;
  } catch (error) {
    console.error('读取 CSV 文件失败:', error.message);
    return null;
  }
}

/**
 * 更新商标信息文件
 */
function updateTrademarkInfo(tmDir, phone, email) {
  const infoFile = path.join(tmDir, '商标信息.txt');
  
  if (!fs.existsSync(infoFile)) {
    console.log(`  ⚠ 商标信息.txt 不存在: ${path.basename(tmDir)}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(infoFile, 'utf-8');
    let updated = false;
    
    // 更新联系电话
    if (phone) {
      const phoneRegex = /联系电话:\s*[^\n]*/;
      if (phoneRegex.test(content)) {
        content = content.replace(phoneRegex, `联系电话: ${phone}`);
        updated = true;
      } else {
        // 如果找不到联系电话行，尝试在邮箱前插入
        const emailRegex = /邮箱[：:]\s*[^\n]*/;
        if (emailRegex.test(content)) {
          content = content.replace(emailRegex, `联系电话: ${phone}\n            邮箱： ${email || ''}`);
          updated = true;
        }
      }
    }
    
    // 更新邮箱
    if (email) {
      const emailRegex = /邮箱[：:]\s*[^\n]*/;
      if (emailRegex.test(content)) {
        content = content.replace(emailRegex, `邮箱： ${email}`);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(infoFile, content, 'utf-8');
      return true;
    } else {
      console.log(`  ⚠ 未找到需要更新的字段: ${path.basename(tmDir)}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ 更新失败 ${path.basename(tmDir)}:`, error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('开始更新客户联系信息...\n');
  
  // 读取 CSV 数据
  const dataMap = readCSV();
  if (!dataMap) {
    console.error('无法读取 CSV 数据，程序退出');
    return;
  }
  
  // 检查基础目录
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`目录不存在: ${BASE_DIR}`);
    return;
  }
  
  // 读取所有客户文件夹
  const items = fs.readdirSync(BASE_DIR, { withFileTypes: true });
  const folders = items.filter(item => item.isDirectory() && item.name !== 'A级客户' && item.name !== 'B级客户' && item.name !== 'C级客户');
  
  console.log(`找到 ${folders.length} 个客户文件夹\n`);
  
  let successCount = 0;
  let notFoundCount = 0;
  let noDataCount = 0;
  
  // 遍历每个客户文件夹
  folders.forEach((folder, index) => {
    const tmDir = path.join(BASE_DIR, folder.name);
    const tmName = folder.name;
    
    // 查找匹配的数据
    let contactData = dataMap.get(tmName);
    
    // 如果直接匹配失败，尝试模糊匹配（去除空格等）
    if (!contactData) {
      for (const [key, value] of dataMap.entries()) {
        if (key.trim() === tmName.trim() || key.replace(/\s+/g, '') === tmName.replace(/\s+/g, '')) {
          contactData = value;
          break;
        }
      }
    }
    
    if (!contactData) {
      console.log(`  ⚠ ${tmName} - 在 CSV 中未找到匹配数据`);
      notFoundCount++;
      return;
    }
    
    if (!contactData.phone && !contactData.email) {
      console.log(`  ⚠ ${tmName} - 联系信息为空`);
      noDataCount++;
      return;
    }
    
    // 更新文件
    const success = updateTrademarkInfo(tmDir, contactData.phone, contactData.email);
    if (success) {
      const info = [];
      if (contactData.phone) info.push(`电话: ${contactData.phone}`);
      if (contactData.email) info.push(`邮箱: ${contactData.email}`);
      console.log(`  ✓ ${tmName} - ${info.join(', ')}`);
      successCount++;
    }
  });
  
  console.log(`\n更新完成！`);
  console.log(`  成功: ${successCount} 个`);
  console.log(`  未找到匹配: ${notFoundCount} 个`);
  console.log(`  联系信息为空: ${noDataCount} 个`);
}

// 运行主函数
main();

