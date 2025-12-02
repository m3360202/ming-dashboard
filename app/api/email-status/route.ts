import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const days = searchParams.get('days')
  const email = searchParams.get('email')
  const emailIds = searchParams.get('emailIds')
  const status = searchParams.get('status')
  const start = searchParams.get('start') || '0'
  const limit = searchParams.get('limit') || '100'

  // 验证时间参数
  if (!startDate && !endDate && !days) {
    return NextResponse.json(
      { success: false, message: '必须提供时间区间参数：startDate/endDate 或 days' },
      { status: 400 }
    )
  }

  // 构建查询参数
  const params = new URLSearchParams()
  params.append('apiUser', process.env.NEXT_PUBLIC_SENDCLOUD_API_USER!)
  params.append('apiKey', process.env.NEXT_PUBLIC_SENDCLOUD_API_KEY!)
  
  // 优先使用日期范围，如果同时提供日期和天数，只使用日期范围
  if (startDate && endDate) {
    params.append('startDate', startDate)
    params.append('endDate', endDate)
  } else if (days) {
    params.append('days', days)
  }
  
  if (email) params.append('email', email)
  if (emailIds) params.append('emailIds', emailIds)
  if (status) params.append('status', status)
  params.append('start', start)
  params.append('limit', limit)

  try {
    const response = await fetch(`https://api.sendcloud.net/apiv2/data/emailStatus?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    if (result.result === false) {
      return NextResponse.json({
        success: false,
        message: result.message || '查询失败',
        statusCode: result.statusCode
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      data: result.info || {},
      message: result.message || '查询成功'
    })
  } catch (error) {
    console.error('查询邮件状态失败:', error)
    return NextResponse.json(
      { success: false, message: '邮件状态查询服务不可用' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { startDate, endDate, days, email, emailIds, status, start = '0', limit = '100' } = body

  // 验证时间参数
  if (!startDate && !endDate && !days) {
    return NextResponse.json(
      { success: false, message: '必须提供时间区间参数：startDate/endDate 或 days' },
      { status: 400 }
    )
  }

  // 构建查询参数
  const params = new URLSearchParams()
  params.append('apiUser', process.env.NEXT_PUBLIC_SENDCLOUD_API_USER!)
  params.append('apiKey', process.env.NEXT_PUBLIC_SENDCLOUD_API_KEY!)
  
  // 优先使用日期范围，如果同时提供日期和天数，只使用日期范围
  if (startDate && endDate) {
    params.append('startDate', startDate)
    params.append('endDate', endDate)
  } else if (days) {
    params.append('days', days)
  }
  
  if (email) params.append('email', email)
  if (emailIds) params.append('emailIds', emailIds)
  if (status) params.append('status', status)
  params.append('start', start)
  params.append('limit', limit)

  try {
    const response = await fetch(`https://api.sendcloud.net/apiv2/data/emailStatus?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    if (result.result === false) {
      return NextResponse.json({
        success: false,
        message: result.message || '查询失败',
        statusCode: result.statusCode
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      data: result.info || {},
      message: result.message || '查询成功'
    })
  } catch (error) {
    console.error('查询邮件状态失败:', error)
    return NextResponse.json(
      { success: false, message: '邮件状态查询服务不可用' },
      { status: 500 }
    )
  }
}

