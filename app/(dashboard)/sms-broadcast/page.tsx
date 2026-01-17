'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, PlusCircle } from 'lucide-react'

// 短信模板定义
const SMS_TEMPLATES = {
  '流程通知': [
    { label: '提交确认', content: '您的商标{tmName}已提交，申请号{regNo}，日期{date}。请核对信息，有误速联。' },
    { label: '受理通知', content: '好消息！商标{tmName}已获官方受理，受理号{regNo}。下一步进入审查阶段，请耐心等待。' },
    { label: '审查进展', content: '商标{tmName}正处于{status}阶段，如有最新进展我们会第一时间通知您。' },
    { label: '公告通知', content: '重要提醒：商标{tmName}已进入初审公告期，截止{date}。若无异议将核准注册。' },
    { label: '注册下发', content: '喜讯！商标{tmName}已注册成功，证书正寄往您处，请注意查收。' },
  ],
  '期限提醒': [
    { label: '官费缴纳', content: '紧急提醒：商标{tmName}官费缴纳截止{date}，请及时处理以免申请失效。' },
    { label: '驳回复审', content: '警示：商标{tmName}被驳回，复审绝限{date}。放弃将失效，如需争取请立即联系我们。' },
    { label: '异议答辩', content: '预警：商标{tmName}遭他人异议，答辩截止{date}。不答辩视为放弃，请尽快沟通对策。' },
    { label: '续展提醒', content: '续展提醒：商标{tmName}将于{date}到期。品牌资产珍贵，请在{deadline}前办理续展，以免注销。' },
  ],
  '风险预警': [
    { label: '近似监测', content: '监测发现第{cls}类有近似商标“{similarTm}”正在公告。可能影响您的品牌，建议考虑异议。' },
    { label: '侵权线索', content: '监控发现疑似侵权链接/商品：{link}。如非授权销售，建议立即取证维权。' },
    { label: '域名抢注', content: '监测到与您的品牌近似的域名{domain}已被注册，请注意品牌保护。' },
  ]
}

export default function SmsBroadcastPage() {
  const [content, setContent] = useState('')
  const [phones, setPhones] = useState('')
  const [templateId, setTemplateId] = useState('1') // 默认 ID 为 1
  const [isSending, setIsSending] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [result, setResult] = useState('')

  const handleTemplateClick = (templateContent: string) => {
    setContent(templateContent)
  }

  // 申请模板
  const handleApplyTemplate = async (label: string, text: string) => {
    setIsApplying(true)
    setResult(`正在申请模板：${label}...`)
    try {
      // 自动替换变量格式：将 {tmName} 转换为 %tmName% 以符合 SendCloud 规范
      const formattedText = text.replace(/\{(\w+)\}/g, '%$1%')
      
      // 生成唯一的模板名称：标签_时间戳
      const templateName = `${label}_${Date.now()}`
      
      const response = await fetch('/api/add-sms-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateName,
          templateText: formattedText 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTemplateId(String(data.templateId))
        setResult(`模板申请成功！ID: ${data.templateId} (已自动填入)`)
        // 填充内容时保留原始的 {} 格式，方便用户阅读，或者也可以改成 % % 格式
        // 这里为了对应 ID，我们填充转换后的 % % 格式内容，提示用户这是变量
        setContent(formattedText) 
      } else {
        setResult(`模板申请失败: ${data.message}`)
      }
    } catch (error) {
      setResult(`申请错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsApplying(false)
    }
  }

  // 批量申请所有模板
  const handleBatchApply = async () => {
    if (!confirm('确定要将所有预设模板提交到 SendCloud 吗？这可能需要几十秒钟。')) return

    setIsApplying(true)
    setResult('开始批量申请模板...')
    
    const results: string[] = []
    let successCount = 0
    let failCount = 0

    // 展平所有模板
    const allTemplates = Object.values(SMS_TEMPLATES).flat()
    
    for (const tpl of allTemplates) {
      try {
        setResult(`正在申请 (${successCount + failCount + 1}/${allTemplates.length}): ${tpl.label}...`)
        
        const formattedText = tpl.content.replace(/\{(\w+)\}/g, '%$1%')
        const templateName = `${tpl.label}_${Date.now()}` // 防止重名
        
        const response = await fetch('/api/add-sms-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            templateName,
            templateText: formattedText 
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          results.push(`✅ ${tpl.label}: 成功 (ID: ${data.templateId})`)
          successCount++
        } else {
          results.push(`❌ ${tpl.label}: 失败 (${data.message})`)
          failCount++
        }
        
        // 简单延时避免触发限流
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        results.push(`❌ ${tpl.label}: 错误 (${error instanceof Error ? error.message : '未知'})`)
        failCount++
      }
    }

    setResult(`批量申请完成！成功 ${successCount} 个，失败 ${failCount} 个。\n\n详情：\n${results.join('\n')}`)
    setIsApplying(false)
  }

  const handleSend = async () => {
    const phoneList = phones.split(/[,，\n]/).map(p => p.trim()).filter(p => p)
    if (!phoneList.length) {
      setResult('请输入有效的手机号码')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          phones: phoneList,
          templateId: templateId.trim() || undefined
        })
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
            <label className="text-sm font-medium">SendCloud 模板 ID</label>
            <Input
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              placeholder="请输入模板 ID（例如：1）"
            />
            <p className="text-xs text-muted-foreground">
              注：如果指定模板 ID，下方的“短信内容”将作为变量参数（vars）发送。如果模板只有一个变量 %content%，请填写 &#123;"%content%": "内容"&#125; 格式。
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">快速模板（点击标签填充，点击 + 号申请模板ID）</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBatchApply}
                disabled={isApplying}
                className="h-7 text-xs"
              >
                {isApplying ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                一键批量申请所有模板
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/50 p-4 rounded-lg">
              {Object.entries(SMS_TEMPLATES).map(([category, templates]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                  <div className="flex flex-col gap-2">
                    {templates.map((tpl) => (
                      <div key={tpl.label} className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs flex-1 justify-start overflow-hidden text-ellipsis"
                          onClick={() => handleTemplateClick(tpl.content)}
                          title={tpl.content}
                        >
                          {tpl.label}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() => handleApplyTemplate(tpl.label, tpl.content)}
                          disabled={isApplying}
                          title="向 SendCloud 申请此模板"
                        >
                          {isApplying ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label>短信内容 (或 vars 变量 JSON)</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入短信内容，支持 {变量} 替换"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              提示：点击上方模板可快速填入。内容中的 {'{tmName}'} 等变量请手动修改为实际内容。
            </p>
          </div>
          <div className="space-y-2">
            <label>手机号码</label>
            <Textarea
              value={phones}
              onChange={(e) => setPhones(e.target.value)}
              placeholder="多个号码用逗号或换行分隔"
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