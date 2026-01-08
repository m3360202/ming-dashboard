'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllTemplates } from '@/utils/email-templates'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 动态导入MD编辑器，避免SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => {
    const MDEditor = mod.default;
    // 获取默认命令并添加图片上传
    const commands = mod.getCommands();
    commands.push({
      name: 'image',
      keyCommand: 'image',
      buttonProps: { 'aria-label': '插入图片' },
      icon: (
        <svg width="12" height="12" viewBox="0 0 20 20">
          <path fill="currentColor" d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-6-4 4-2-2-6 6V4h16v11z"/>
        </svg>
      ),
      execute: (state, api) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              const imageUrl = await uploadImage(file);
              api.replaceSelection(`![${file.name}](${imageUrl})`);
            } catch (error) {
              console.error('图片上传失败:', error);
            }
          }
        };
        input.click();
      }
    });
    
    return function EnhancedMDEditor(props: any) {
      return (
        <MDEditor 
          {...props}
          commands={commands}
          previewOptions={{
            components: {
              img: ({ src, alt }) => (
                <img 
                  src={src} 
                  alt={alt} 
                  style={{ maxWidth: '100%' }} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )
            }
          }}
        />
      );
    };
  }),
  { ssr: false }
)

// 复用现有的OSS上传方法
async function uploadImage(file: File): Promise<string> {
  const { uploadFile } = await import('@/utils/upload');
  const fileName = await uploadFile(file);
  return `https://${process.env.NEXT_PUBLIC_OSS_APP_BUCKET}.${process.env.NEXT_PUBLIC_OSS_APP_REGION}.aliyuncs.com/${fileName}`;
}

export default function EmailBroadcastPage() {
  const [emailContent, setEmailContent] = useState('')
  const [emailList, setEmailList] = useState('')
  const [subject, setSubject] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState('')
  
  // 加载模板
  const templates = getAllTemplates()
  
  // 应用模板
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setEmailContent(template.content)
    }
  }

  // 解析邮箱列表，支持半角和全角逗号分隔
  const parseEmailList = (emails: string) => {
    // 替换全角逗号为半角逗号，然后分割
    return emails.replace(/，/g, ',').split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)
  }

  const handleSendEmail = async (type: 'single' | 'batch') => {
    if (!emailContent.trim()) {
      setSendResult('请填写邮件内容')
      return
    }

    if (!subject.trim()) {
      setSendResult('请填写邮件主题')
      return
    }

    const emails = parseEmailList(emailList)
    if (emails.length === 0) {
      setSendResult('请填写至少一个邮箱地址')
      return
    }

    if (type === 'single' && emails.length > 1) {
      setSendResult('单发模式只能发送给一个邮箱地址')
      return
    }

    setIsSending(true)
    setSendResult('')

    try {
      // 这里调用SendCloud API发送邮件
      const result = await sendEmailViaSendCloud({
        subject,
        content: emailContent,
        emails,
        type
      })

      if (result.success) {
        setSendResult(`邮件发送成功！${type === 'batch' ? `共发送${emails.length}封邮件` : '单发邮件已发送'}`)
        if (type === 'single') {
          setEmailList('') // 清空邮箱列表
        }
      } else {
        setSendResult(`发送失败：${result.message}`)
      }
    } catch (error) {
      setSendResult('发送失败，请检查网络连接或配置')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">邮件群发系统</h1>
        <p className="text-muted-foreground">使用SendCloud服务发送邮件，支持单发和群发模式</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：邮件内容编辑器 */}
        <Card>
          <CardHeader>
            <CardTitle>邮件内容编辑</CardTitle>
            <CardDescription>使用Markdown格式编写邮件内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">邮件主题</Label>
              <Input
                id="subject"
                placeholder="请输入邮件主题"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">邮件内容</Label>
              <div className="flex gap-2 mb-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSubject('')
                    setEmailContent('')
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  自定义模板
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applyTemplate('level-a')}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  A级客户模板
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applyTemplate('level-b')}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  B级客户模板
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applyTemplate('level-c')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  C级客户模板
                </Button>
              </div>
              <div data-color-mode="light">
                <MDEditor
                  value={emailContent}
                  onChange={(value: any) => setEmailContent(value || '')}
                  height={400}
                  preview="edit"
                  textareaProps={{
                    placeholder: `支持Markdown格式：
# 一级标题
## 二级标题
**粗体文字**
*斜体文字*
- 无序列表项
1. 有序列表项
[链接文字](https://example.com)
![图片描述](图片URL)

点击工具栏图片按钮可上传图片`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：邮箱列表和发送控制 */}
        <Card>
          <CardHeader>
            <CardTitle>收件人管理</CardTitle>
            <CardDescription>输入邮箱地址，支持半角或全角逗号分隔</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">邮箱地址</Label>
              <textarea
                id="emails"
                placeholder="请输入邮箱地址，多个邮箱用逗号（,）或中文逗号（，）分隔"
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                className="w-full h-32 p-2 border rounded-md resize-none"
              />
              <p className="text-sm text-muted-foreground">
                已识别邮箱：{parseEmailList(emailList).length} 个
              </p>
            </div>

            <Tabs defaultValue="batch" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="batch">群发模式</TabsTrigger>
                <TabsTrigger value="single">单发模式</TabsTrigger>
              </TabsList>
              
              <TabsContent value="batch" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  将邮件发送给所有填写的邮箱地址
                </div>
                <Button 
                  onClick={() => handleSendEmail('batch')}
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? '发送中...' : '群发邮件'}
                </Button>
              </TabsContent>
              
              <TabsContent value="single" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  只发送给第一个邮箱地址，适合测试
                </div>
                <Button 
                  onClick={() => handleSendEmail('single')}
                  disabled={isSending}
                  className="w-full"
                  variant="outline"
                >
                  {isSending ? '发送中...' : '单发邮件'}
                </Button>
              </TabsContent>
            </Tabs>

            {sendResult && (
              <div className={`p-3 rounded-md text-sm ${
                sendResult.includes('成功') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {sendResult}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// SendCloud邮件发送函数（通过代理API）
async function sendEmailViaSendCloud(params: {
  subject: string
  content: string
  emails: string[]
  type: 'single' | 'batch'
}) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: params.subject,
        content: params.content,
        emails: params.emails,
        type: params.type
      })
    })
    
    if (!response.ok) throw new Error('网络请求失败')
    return await response.json()
  } catch (error) {
    console.error('发送失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
}