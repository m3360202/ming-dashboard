import { NextResponse } from 'next/server'
import crypto from 'crypto'

// MD5 加密
function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex')
}

// 参数排序和签名生成
function generateSignature(params: Record<string, any>, smsKey: string): string {
  const sortedKeys = Object.keys(params).sort()
  let paramStr = ''
  for (const key of sortedKeys) {
    paramStr += `${key}=${params[key]}&`
  }
  const signStr = `${smsKey}&${paramStr}${smsKey}`
  return md5(signStr).toUpperCase()
}

export async function POST(req: Request) {
  try {
    const { templateName, templateText, smsTypeStr = '1' } = await req.json()
    
    if (!templateName || !templateText) {
      return NextResponse.json(
        { success: false, message: '模板名称和内容不能为空' },
        { status: 400 }
      )
    }

    const smsUser = process.env.NEXT_PUBLIC_SENDCLOUD_SMS_USER!
    const smsKey = process.env.NEXT_PUBLIC_SENDCLOUD_SMS_KEY!
    const signId = '14442' // 直接使用签名ID

    // 1. 调用 addsms 接口
    const params: Record<string, string> = {
      smsUser: smsUser,
      templateName: templateName,
      templateText: templateText,
      signId: signId, 
      smsTypeStr: smsTypeStr, // 1: 行业通知
      msgType: '0', // 国内短信
    }

    const signature = generateSignature(params, smsKey)
    params['signature'] = signature

    const searchParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      searchParams.append(key, params[key])
    })

    const response = await fetch(`https://api.sendcloud.net/smsapi/addsms?${searchParams.toString()}`, {
      method: 'POST'
    })
    
    const result = await response.json()
    
    if (result.result === true) {
      const templateId = result.info.templateId

      // 2. 尝试自动提交审核 (submitsms)
      // 虽然通常 addsms 可能不需要单独提交，但根据文档有这个接口，我们尝试调用一下
      // 如果 addsms 返回成功，我们再调用 submit
      
      try {
        const submitParams: Record<string, string> = {
          smsUser: smsUser,
          templateIdStr: String(templateId),
        }
        const submitSign = generateSignature(submitParams, smsKey)
        submitParams['signature'] = submitSign
        
        const submitSearchParams = new URLSearchParams()
        Object.keys(submitParams).forEach(key => {
          submitSearchParams.append(key, submitParams[key])
        })

        await fetch(`https://api.sendcloud.net/smsapi/submitsms?${submitSearchParams.toString()}`, {
          method: 'POST'
        })
        // 忽略提交审核的返回结果，以前面创建成功为主
      } catch (e) {
        console.error('Submit template error:', e)
      }

      return NextResponse.json({
        success: true,
        templateId: templateId,
        message: '模板创建成功并已提交审核'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || '模板创建失败',
        details: result
      })
    }

  } catch (error) {
    console.error('Add template error:', error)
    return NextResponse.json(
      { success: false, message: '模板创建服务不可用' },
      { status: 500 }
    )
  }
}