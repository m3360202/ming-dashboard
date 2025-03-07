
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
