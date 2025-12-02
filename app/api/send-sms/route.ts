import { NextResponse } from 'next/server'
import crypto from 'crypto'

// 生成 SendCloud 签名
function generateSignature(params: Record<string, string>, smsKey: string): string {
  // 排除 smsKey 和 signature 字段，按字母升序排列
  const sortedKeys = Object.keys(params).sort()
  
  // 连接参数字符串
  const paramStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
  
  // 生成签名字符串
  const signStr = `${smsKey}&${paramStr}&${smsKey}`
  
  // 计算 MD5
  return crypto.createHash('md5').update(signStr).digest('hex')
}

export async function POST(req: Request) {
  try {
    const { content, phones } = await req.json()
    
    if (!content || !phones || phones.length === 0) {
      return NextResponse.json(
        { success: false, message: '短信内容和手机号码不能为空' },
        { status: 400 }
      )
    }

    const smsUser = process.env.NEXT_PUBLIC_SENDCLOUD_SMS_USER!
    const smsKey = process.env.NEXT_PUBLIC_SENDCLOUD_SMS_KEY!
    
    // 准备参数（不包括 smsKey）
    const params: Record<string, string> = {
      smsUser: smsUser,
      msgType: '0',
      phone: phones.join(','),
      msg: content
    }
    
    // 生成签名
    const signature = generateSignature(params, smsKey)
    
    // 构建表单数据
    const formData = new FormData()
    Object.keys(params).forEach(key => {
      formData.append(key, params[key])
    })
    formData.append('signature', signature)

    const response = await fetch('https://api.sendcloud.net/apiv2/sms/send', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      success: result.result === true,
      message: result.message || (result.result === true ? '发送成功' : '发送失败')
    })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { success: false, message: '短信发送服务不可用' },
      { status: 500 }
    )
  }
}

