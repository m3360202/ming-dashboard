const fs = require('fs');
const path = require('path');

// 配置路径
const BASE_DIR = path.join(__dirname, 'result', '无效答辩');
const A_LEVEL_DIR = path.join(BASE_DIR, 'A级客户');
const B_LEVEL_DIR = path.join(BASE_DIR, 'B级客户');
const C_LEVEL_DIR = path.join(BASE_DIR, 'C级客户');

// 输出文件路径
const A_EMAIL_FILE = path.join(BASE_DIR, 'A级客户邮箱.txt');
const B_EMAIL_FILE = path.join(BASE_DIR, 'B级客户邮箱.txt');
const C_EMAIL_FILE = path.join(BASE_DIR, 'C级客户邮箱.txt');

/**
 * 从商标信息文件中提取邮箱
 * @param {string} folderPath 企业文件夹路径
 * @returns {string|null} 邮箱字符串（多个邮箱用逗号分隔）或 null
 */
function extractEmails(folderPath) {
  const infoFile = path.join(folderPath, '商标信息.txt');
  
  if (!fs.existsSync(infoFile)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(infoFile, 'utf-8');
    const lines = content.split('\n');
    
    // 提取所有包含 @ 的行（邮箱）
    const emails = [];
    for (const line of lines) {
      const trimmedLine = line.trim();
      // 检查是否包含 @ 符号（邮箱的基本特征）
      if (trimmedLine.includes('@')) {
        // 如果一行中有多个邮箱（用逗号分隔），需要拆分
        const emailMatches = trimmedLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          emails.push(...emailMatches);
        }
      }
    }
    
    // 去重并返回（用逗号连接）
    const uniqueEmails = [...new Set(emails)];
    return uniqueEmails.length > 0 ? uniqueEmails.join(',') : null;
  } catch (error) {
    console.error(`  读取失败: ${error.message}`);
    return null;
  }
}

/**
 * 处理指定级别的客户文件夹
 * @param {string} levelDir 级别文件夹路径
 * @param {string} outputFile 输出文件路径
 * @param {string} levelName 级别名称（用于日志）
 * @returns {number} 处理的企业数量
 */
function processLevel(levelDir, outputFile, levelName) {
  if (!fs.existsSync(levelDir)) {
    console.log(`${levelName}文件夹不存在，跳过`);
    return 0;
  }
  
  // 读取所有企业文件夹
  const items = fs.readdirSync(levelDir, { withFileTypes: true });
  const folders = items.filter(item => item.isDirectory());
  
  if (folders.length === 0) {
    console.log(`${levelName}文件夹为空，跳过`);
    return 0;
  }
  
  console.log(`\n处理 ${levelName} (${folders.length} 个企业)...`);
  
  const contents = [];
  let successCount = 0;
  let skipCount = 0;
  
  folders.forEach((folder, index) => {
    const folderPath = path.join(levelDir, folder.name);
    const emails = extractEmails(folderPath);
    
    if (emails) {
      // 每个客户一行，只包含邮箱（用逗号分隔）
      contents.push(emails);
      successCount++;
      console.log(`  ✓ ${folder.name} - ${emails}`);
    } else {
      skipCount++;
      console.log(`  ⚠ ${folder.name} - 未找到邮箱`);
    }
  });
  
  // 写入文件（每行一个客户的邮箱，多个邮箱用逗号分隔）
  if (contents.length > 0) {
    try {
      fs.writeFileSync(outputFile, contents.join('\n'), 'utf-8');
      console.log(`\n✓ ${levelName}邮箱文件已生成: ${path.basename(outputFile)}`);
      console.log(`  成功: ${successCount} 个，跳过: ${skipCount} 个`);
    } catch (error) {
      console.error(`\n✗ 写入文件失败 ${outputFile}:`, error.message);
    }
  } else {
    console.log(`\n⚠ ${levelName}没有可写入的内容`);
  }
  
  return successCount;
}

/**
 * 主函数
 */
function main() {
  console.log('开始收集客户邮箱信息...\n');
  console.log('='.repeat(50));
  
  // 检查基础目录是否存在
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`错误: 目录不存在 ${BASE_DIR}`);
    process.exit(1);
  }
  
  // 处理各级客户
  const aCount = processLevel(A_LEVEL_DIR, A_EMAIL_FILE, 'A级客户');
  const bCount = processLevel(B_LEVEL_DIR, B_EMAIL_FILE, 'B级客户');
  const cCount = processLevel(C_LEVEL_DIR, C_EMAIL_FILE, 'C级客户');
  
  // 输出统计信息
  console.log('\n' + '='.repeat(50));
  console.log('收集完成！');
  console.log(`A级客户: ${aCount} 个企业`);
  console.log(`B级客户: ${bCount} 个企业`);
  console.log(`C级客户: ${cCount} 个企业`);
  console.log(`总计: ${aCount + bCount + cCount} 个企业`);
  console.log('='.repeat(50));
  console.log(`\n文件已生成在: ${BASE_DIR}`);
  console.log(`  - A级客户邮箱.txt`);
  console.log(`  - B级客户邮箱.txt`);
  console.log(`  - C级客户邮箱.txt`);
}

// 执行主函数
main();

