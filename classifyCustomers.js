const fs = require('fs');
const path = require('path');

// 配置路径
const BASE_DIR = path.join(__dirname, 'result', '无效答辩');
const A_LEVEL_DIR = path.join(BASE_DIR, 'A级客户');
const B_LEVEL_DIR = path.join(BASE_DIR, 'B级客户');
const C_LEVEL_DIR = path.join(BASE_DIR, 'C级客户');

// 需要排除的文件夹（目标文件夹）
const EXCLUDE_DIRS = ['A级客户', 'B级客户', 'C级客户'];

/**
 * 从文件中提取智慧树可成交评级
 * @param {string} filePath 文件路径
 * @returns {string|null} 评级等级 (A, B, C) 或 null
 */
function extractRating(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 查找【智慧树可成交评级】部分
    const ratingMatch = content.match(/【智慧树可成交评级】[\s\S]*?等级[：:]\s*([A-Z][+-]?|S)/i);
    
    if (ratingMatch && ratingMatch[1]) {
      const level = ratingMatch[1].toUpperCase();
      
      // 提取基础等级（A, B, C, S）
      const baseLevel = level.charAt(0);
      
      // 分类逻辑
      if (baseLevel === 'A' || baseLevel === 'S') {
        return 'A';
      } else if (baseLevel === 'B') {
        return 'B';
      } else if (baseLevel === 'C') {
        return 'C';
      }
    }
    
    // 如果没找到标准格式，尝试其他格式
    const altMatch = content.match(/智慧树可成交评级[\s\S]*?等级[：:]\s*([A-Z][+-]?|S)/i);
    if (altMatch && altMatch[1]) {
      const level = altMatch[1].toUpperCase();
      const baseLevel = level.charAt(0);
      
      if (baseLevel === 'A' || baseLevel === 'S') {
        return 'A';
      } else if (baseLevel === 'B') {
        return 'B';
      } else if (baseLevel === 'C') {
        return 'C';
      }
    }
    
    return null;
  } catch (error) {
    console.error(`读取文件失败 ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 移动文件夹
 * @param {string} sourceDir 源文件夹路径
 * @param {string} targetDir 目标文件夹路径
 */
function moveDirectory(sourceDir, targetDir) {
  try {
    // 确保目标目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const dirName = path.basename(sourceDir);
    const newPath = path.join(targetDir, dirName);
    
    // 如果目标位置已存在同名文件夹，先删除
    if (fs.existsSync(newPath)) {
      console.log(`  警告: 目标位置已存在 ${dirName}，将覆盖`);
      fs.rmSync(newPath, { recursive: true, force: true });
    }
    
    // 移动文件夹
    fs.renameSync(sourceDir, newPath);
    console.log(`  ✓ 已移动到 ${path.basename(targetDir)}`);
    return true;
  } catch (error) {
    console.error(`  移动失败:`, error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('开始分类客户文件夹...\n');
  
  // 检查基础目录是否存在
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`错误: 目录不存在 ${BASE_DIR}`);
    process.exit(1);
  }
  
  // 确保目标目录存在
  [A_LEVEL_DIR, B_LEVEL_DIR, C_LEVEL_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`创建目录: ${path.basename(dir)}`);
    }
  });
  
  // 读取所有文件夹
  const items = fs.readdirSync(BASE_DIR, { withFileTypes: true });
  const folders = items
    .filter(item => item.isDirectory())
    .filter(item => !EXCLUDE_DIRS.includes(item.name));
  
  console.log(`找到 ${folders.length} 个企业文件夹\n`);
  
  let aCount = 0;
  let bCount = 0;
  let cCount = 0;
  let errorCount = 0;
  
  // 处理每个文件夹
  folders.forEach(folder => {
    const folderPath = path.join(BASE_DIR, folder.name);
    const ratingFile = path.join(folderPath, '价值分析和成交策略评估.txt');
    
    console.log(`处理: ${folder.name}`);
    
    // 检查是否存在评级文件
    if (!fs.existsSync(ratingFile)) {
      console.log(`  ⚠ 未找到评级文件，归类到 C级客户`);
      if (moveDirectory(folderPath, C_LEVEL_DIR)) {
        cCount++;
      } else {
        errorCount++;
      }
      console.log('');
      return;
    }
    
    // 提取评级
    const rating = extractRating(ratingFile);
    
    if (!rating) {
      console.log(`  ⚠ 无法提取评级，归类到 C级客户`);
      if (moveDirectory(folderPath, C_LEVEL_DIR)) {
        cCount++;
      } else {
        errorCount++;
      }
    } else {
      let targetDir;
      if (rating === 'A') {
        targetDir = A_LEVEL_DIR;
        aCount++;
      } else if (rating === 'B') {
        targetDir = B_LEVEL_DIR;
        bCount++;
      } else {
        targetDir = C_LEVEL_DIR;
        cCount++;
      }
      
      console.log(`  评级: ${rating}级`);
      if (!moveDirectory(folderPath, targetDir)) {
        errorCount++;
      }
    }
    
    console.log('');
  });
  
  // 输出统计信息
  console.log('='.repeat(50));
  console.log('分类完成！');
  console.log(`A级客户: ${aCount} 个`);
  console.log(`B级客户: ${bCount} 个`);
  console.log(`C级客户: ${cCount} 个`);
  if (errorCount > 0) {
    console.log(`错误: ${errorCount} 个`);
  }
  console.log('='.repeat(50));
}

// 执行主函数
main();

