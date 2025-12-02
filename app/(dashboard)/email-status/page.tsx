'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EmailStatus {
  emailId: string
  status: string
  subStatus: string | null
  subStatusDesc: string | null
  apiUser: string
  recipients: string
  requestTime: string
  modifiedTime: string
  sendLog: string
}

interface Statistics {
  total: number
  delivered: number
  invalid: number
  softBounce: number
  pending: number
  successRate: number
}

const ITEMS_PER_PAGE = 20

export default function EmailStatusPage() {
  const [queryStartDate, setQueryStartDate] = useState('')
  const [queryEndDate, setQueryEndDate] = useState('')
  const [queryDays, setQueryDays] = useState('1')
  const [statusFilter, setStatusFilter] = useState<string>('') // 状态过滤器：''=全部, '1'=送达, '4'=无效邮件, '5'=软退信, '18'=请求中
  const [currentPage, setCurrentPage] = useState(1)
  const [isQuerying, setIsQuerying] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [queryResult, setQueryResult] = useState<EmailStatus[]>([])
  const [queryTotal, setQueryTotal] = useState(0)
  const [queryError, setQueryError] = useState('')
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    delivered: 0,
    invalid: 0,
    softBounce: 0,
    pending: 0,
    successRate: 0
  })
  const [allDataForStats, setAllDataForStats] = useState<EmailStatus[]>([]) // 用于统计的所有数据

  // 设置默认日期为今天
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setQueryStartDate(today)
    setQueryEndDate(today)
  }, [])

  // 计算统计信息
  const calculateStatistics = (data: EmailStatus[]) => {
    const stats: Statistics = {
      total: data.length,
      delivered: 0,
      invalid: 0,
      softBounce: 0,
      pending: 0,
      successRate: 0
    }

    data.forEach(item => {
      if (item.status === '送达') {
        stats.delivered++
      } else if (item.status?.includes('无效邮件')) {
        stats.invalid++
      } else if (item.status?.includes('软退信')) {
        stats.softBounce++
      } else if (item.status === '请求中') {
        stats.pending++
      }
    })

    // 计算成功率（送达数 / (总数 - 请求中数)）
    const completedCount = stats.total - stats.pending
    stats.successRate = completedCount > 0 
      ? Math.round((stats.delivered / completedCount) * 100 * 100) / 100 
      : 0

    return stats
  }

  // 获取所有数据用于统计（分页获取）
  const fetchAllDataForStatistics = async (baseParams: any) => {
    setIsLoadingStats(true)
    const allData: EmailStatus[] = []
    let start = 0
    const limit = 100 // API最大限制
    let hasMore = true

    try {
      while (hasMore) {
        const params = { ...baseParams, start: start.toString(), limit: limit.toString() }
        const response = await fetch('/api/email-status?' + new URLSearchParams(params), {
          method: 'GET'
        })
        const result = await response.json()

        if (result.success && result.data) {
          const data = result.data.voList || []
          allData.push(...data)
          
          // 如果返回的数据少于limit，说明已经获取完所有数据
          if (data.length < limit) {
            hasMore = false
          } else {
            start += limit
          }
        } else {
          hasMore = false
        }
      }

      setAllDataForStats(allData)
      const stats = calculateStatistics(allData)
      setStatistics(stats)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // 查询邮件状态
  const handleQueryStatus = async (page: number = 1) => {
    if (!queryStartDate && !queryEndDate && !queryDays) {
      setQueryError('请选择查询日期或输入查询天数')
      return
    }

    setIsQuerying(true)
    setQueryError('')
    setQueryResult([])
    setCurrentPage(page)

    try {
      const params: any = {}
      // 如果同时有开始和结束日期，优先使用日期范围，否则使用天数
      if (queryStartDate && queryEndDate) {
        params.startDate = queryStartDate
        params.endDate = queryEndDate
      } else if (queryDays) {
        params.days = queryDays
      } else if (queryStartDate) {
        // 如果只有开始日期，使用开始日期作为结束日期
        params.startDate = queryStartDate
        params.endDate = queryStartDate
      }

      // 添加状态过滤器
      if (statusFilter) {
        params.status = statusFilter
      }

      // 计算分页参数
      const start = (page - 1) * ITEMS_PER_PAGE
      params.start = start.toString()
      params.limit = ITEMS_PER_PAGE.toString()

      const response = await fetch('/api/email-status?' + new URLSearchParams(params), {
        method: 'GET'
      })

      const result = await response.json()

      if (result.success && result.data) {
        const data = result.data.voList || []
        setQueryResult(data)
        setQueryTotal(parseInt(result.data.total || '0'))
        
        // 获取所有数据用于统计（不应用状态过滤器和分页）
        if (page === 1) {
          const statsParams: any = {}
          // 复制日期参数，但不包含状态过滤器和分页参数
          if (queryStartDate && queryEndDate) {
            statsParams.startDate = queryStartDate
            statsParams.endDate = queryEndDate
          } else if (queryDays) {
            statsParams.days = queryDays
          } else if (queryStartDate) {
            statsParams.startDate = queryStartDate
            statsParams.endDate = queryStartDate
          }
          await fetchAllDataForStatistics(statsParams)
        }
      } else {
        setQueryError(result.message || '查询失败')
        setStatistics({
          total: 0,
          delivered: 0,
          invalid: 0,
          softBounce: 0,
          pending: 0,
          successRate: 0
        })
      }
    } catch (error) {
      setQueryError('查询失败，请检查网络连接')
      setStatistics({
        total: 0,
        delivered: 0,
        invalid: 0,
        softBounce: 0,
        pending: 0,
        successRate: 0
      })
    } finally {
      setIsQuerying(false)
    }
  }

  // 处理状态过滤器变化
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
    // 延迟查询，避免频繁请求
    setTimeout(() => {
      handleQueryStatus(1)
    }, 100)
  }

  // 获取状态标签颜色
  const getStatusBadge = (status: string, subStatus: string | null) => {
    if (status === '送达') {
      return <Badge className="bg-green-500">送达</Badge>
    } else if (status === '请求中') {
      return <Badge className="bg-blue-500">请求中</Badge>
    } else if (status?.includes('无效邮件')) {
      return <Badge className="bg-red-500">无效邮件</Badge>
    } else if (status?.includes('软退信')) {
      return <Badge className="bg-orange-500">软退信</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return dateStr
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">邮件发送结果查询</h1>
        <p className="text-muted-foreground">查询邮件发送状态，包括发送成功、失败原因等信息</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>查询条件</CardTitle>
          <CardDescription>根据日期查询邮件发送状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="queryDays">查询天数</Label>
              <Input
                id="queryDays"
                type="number"
                min="1"
                max="3"
                placeholder="1-3天"
                value={queryDays}
                onChange={(e) => {
                  setQueryDays(e.target.value)
                  setQueryStartDate('')
                  setQueryEndDate('')
                }}
              />
              <p className="text-xs text-muted-foreground">查询最近N天的数据</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="queryStartDate">开始日期</Label>
              <Input
                id="queryStartDate"
                type="date"
                value={queryStartDate}
                onChange={(e) => {
                  setQueryStartDate(e.target.value)
                  setQueryDays('')
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="queryEndDate">结束日期</Label>
              <Input
                id="queryEndDate"
                type="date"
                value={queryEndDate}
                onChange={(e) => {
                  setQueryEndDate(e.target.value)
                  setQueryDays('')
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">状态筛选</Label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">全部状态</option>
                <option value="1">送达</option>
                <option value="4">无效邮件</option>
                <option value="5">软退信</option>
                <option value="18">请求中</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleQueryStatus(1)}
              disabled={isQuerying}
              className="flex-1"
            >
              {isQuerying ? '查询中...' : '查询结果'}
            </Button>
          </div>

          {queryError && (
            <div className="p-3 rounded-md text-sm bg-red-100 text-red-800">
              {queryError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息卡片 */}
      {queryTotal > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总发送数
                {isLoadingStats && <span className="ml-2 text-xs">(统计中...)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">送达数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.delivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">无效邮件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.invalid}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">软退信</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.softBounce}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">成功率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细结果表格 */}
      {queryResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>查询结果</CardTitle>
            <CardDescription>
              共找到 {queryTotal} 条记录，当前显示第 {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, queryTotal)} 条
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>收件人</TableHead>
                      <TableHead>发送状态</TableHead>
                      <TableHead>失败原因</TableHead>
                      <TableHead>请求时间</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead>发送日志</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResult.map((item, index) => (
                      <TableRow key={item.emailId || index}>
                        <TableCell className="font-medium">{item.recipients}</TableCell>
                        <TableCell>
                          {getStatusBadge(item.status, item.subStatus)}
                        </TableCell>
                        <TableCell>
                          {item.subStatusDesc ? (
                            <span className="text-sm text-red-600">{item.subStatusDesc}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(item.requestTime)}</TableCell>
                        <TableCell className="text-sm">{formatDate(item.modifiedTime)}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate" title={item.sendLog}>
                          {item.sendLog || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* 分页控件 */}
            {queryTotal > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  第 {currentPage} 页，共 {Math.ceil(queryTotal / ITEMS_PER_PAGE)} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQueryStatus(currentPage - 1)}
                    disabled={currentPage === 1 || isQuerying}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQueryStatus(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(queryTotal / ITEMS_PER_PAGE) || isQuerying}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {queryResult.length === 0 && !isQuerying && !queryError && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              暂无查询结果，请选择日期后点击查询
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

