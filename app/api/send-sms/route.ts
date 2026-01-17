import { NextResponse } from 'next/server'
import crypto from 'crypto'

// MD5 加密
function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex')
}

// 参数排序和签名生成
function generateSignature(params: Record<string, any>, smsKey: string): string {
  // 1. 排除 signature 字段（如果有），按 key 排序
  const sortedKeys = Object.keys(params).sort()
  
  // 2. 拼接参数字符串: key=value&
  let paramStr = ''
  for (const key of sortedKeys) {
    paramStr += `${key}=${params[key]}&`
  }
  
  // 3. 首尾拼接 smsKey
  const signStr = `${smsKey}&${paramStr}${smsKey}`
  
  // 4. 计算 MD5 并转大写
  return md5(signStr).toUpperCase()
}

export async function POST(req: Request) {
  try {
    const { content, phones, templateId } = await req.json()
    
    if (!phones || phones.length === 0) {
      return NextResponse.json(
        { success: false, message: '手机号码不能为空' },
        { status: 400 }
      )
    }

    const smsUser = process.env.NEXT_PUBLIC_SENDCLOUD_SMS_USER!
    const smsKey = process.env.NEXT_PUBLIC_SENDCLOUD_SMS_KEY!
    
    // 准备参数
    // 根据示例：msgType: 0, smsUser, templateId (可选), phone, vars (可选)
    // 如果没有 templateId，我们假设是用 msg 直接发送内容（视 SendCloud 配置而定）
    // 这里我们保留灵活性：如果有 content，传 msg；如果有 templateId，传 templateId
    
    const params: Record<string, string> = {
      smsUser: smsUser,
      msgType: '0',
      phone: Array.isArray(phones) ? phones.join(',') : phones,
    }

    // 如果提供了模板ID，则优先使用模板
    if (templateId) {
      params['templateId'] = templateId
      // 如果是模板短信，content 可能是 vars JSON 字符串
      if (content) {
        params['vars'] = content
      }
    } else {
      // 普通短信（如果 SendCloud 账户支持）
       // 注意：示例中有 templateId，如果必须用模板，需要前端传 templateId
       // 为了兼容现有前端只传 content 的情况，我们把 content 放在 msg 字段
       if (content) {
         params['msg'] = content
       }
    }
    
    // 生成签名
    const signature = generateSignature(params, smsKey)
    params['signature'] = signature

    // 构建查询字符串
    const searchParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      searchParams.append(key, params[key])
    })

    // 发送请求到 SendCloud v1 接口
    // 示例 URL: http://api.sendcloud.net/smsapi/send
    const apiUrl = 'http://api.sendcloud.net/smsapi/send'
    
    // 示例中：options.path = ... + '?' + data; method: "POST"
    // 这意味着参数是放在 URL query 里的 POST 请求
    
    const response = await fetch(`${apiUrl}?${searchParams.toString()}`, {
      method: 'POST'
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      success: result.result === true,
      message: result.message || (result.result === true ? '发送成功' : '发送失败'),
      details: result
    })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { success: false, message: '短信发送服务不可用' },
      { status: 500 }
    )
  }
}
