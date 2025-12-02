'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export default function SmsBroadcastPage() {
  const [content, setContent] = useState('')
  const [phones, setPhones] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState('')

  const handleSend = async () => {
    const phoneList = phones.split(/[,，]/).map(p => p.trim()).filter(p => p)
    if (!phoneList.length) {
      setResult('请输入有效的手机号码')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, phones: phoneList })
      })
      
      if (!response.ok) {
        setResult(`发送失败: HTTP ${response.status}`)
        return
      }
      
      const data = await response.json()
      setResult(data.success ? `成功发送至${phoneList.length}个号码` : `发送失败: ${data.message}`)
    } catch (error) {
      setResult(`发送失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>短信群发系统</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>短信内容</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入短信内容"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <label>手机号码</label>
            <Textarea
              value={phones}
              onChange={(e) => setPhones(e.target.value)}
              placeholder="多个号码用逗号分隔"
              rows={3}
            />
          </div>
          <Button onClick={handleSend} disabled={isSending} className="w-full">
            {isSending ? '发送中...' : '发送短信'}
          </Button>
          {result && (
            <div className={`p-3 rounded-md ${
              result.includes('成功') ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
