import { PDFDocument } from 'pdf-lib';
//@ts-ignore
import { saveAs } from 'file-saver';
import { Blob } from 'buffer';

export const docxToPdf = async (docxFile: any) => {
  try {
    // 创建一个新的 PDF 文档
    const pdfDoc = await PDFDocument.create();

    // 添加一页
    const page = pdfDoc.addPage([600, 800]);

    // 将 DOCX 内容转换为文本（假设你已经提取了 DOCX 的文本内容）
    const text = await extractTextFromDocx(docxFile);

    // 在 PDF 中添加文本
    page.drawText(text, {
      x: 50,
      y: 750,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // 生成 PDF 文件
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting DOCX to PDF:', error);
    throw error;
  }
};

// 提取 DOCX 文件中的文本内容
const extractTextFromDocx = async (docxFile) => {
  const arrayBuffer = await docxFile.arrayBuffer();
  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip);
  doc.render();
  return doc.getFullText(); // 获取 DOCX 文件的文本内容
};

export function convertToChineseCurrency(amount: number | string): string {
  // 确保 amount 是数字类型
  if (typeof amount !== 'number') {
    amount = Number(amount);
  }

  // 检查转换后的值是否有效
  if (isNaN(amount) || amount < 0 || amount > 999999999999.99) {
    throw new Error("输入的金额无效");
  }

  const chineseNumbers = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const chineseUnits = ["", "拾", "佰", "仟", "万", "拾", "佰", "仟", "亿", "拾", "佰", "仟", "万"];

  // 将金额转换为字符串，并分割整数部分和小数部分
  const amountStr = amount.toFixed(2);
  const [integerPart, decimalPart] = amountStr.split('.');

  // 转换整数部分
  let chineseInteger = '';
  for (let i = 0; i < integerPart.length; i++) {
    const digit = parseInt(integerPart[i]);
    const unit = chineseUnits[integerPart.length - i - 1];
    chineseInteger += chineseNumbers[digit] + unit;
  }

  // 转换小数部分
  const chineseDecimal = chineseNumbers[parseInt(decimalPart[0])] + "角" + chineseNumbers[parseInt(decimalPart[1])] + "分";

  const chineseDecimalResult = chineseDecimal.replace('零角零分','整');

  // 处理特殊情况，如零元、零角、零分等
  chineseInteger = chineseInteger.replace(/零[拾佰仟]/g, '零').replace(/零+/g, '零').replace(/零$/, '');
  chineseInteger = chineseInteger || "零";

  return `${chineseInteger}元${chineseDecimalResult}`;
}
