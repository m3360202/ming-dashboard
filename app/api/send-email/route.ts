import { NextResponse } from 'next/server'
import { marked } from 'marked'

export async function POST(req: Request) {
  const { subject, content, emails, type } = await req.json()
  
  // 将 Markdown 转换为 HTML
  const htmlContent = await marked(content, {
    gfm: true, // 启用 GitHub Flavored Markdown
    breaks: true, // 将换行符转换为 <br>
  })
  
  // 添加基本的邮件样式
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .email-container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .logo-container {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .logo-container img {
          max-width: 120px;
          height: auto;
        }
        h1, h2, h3, h4, h5, h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
        p { margin-bottom: 16px; }
        a { color: #0366d6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        code {
          padding: .2em .4em;
          margin: 0;
          font-size: 85%;
          background-color: #f6f8fa;
          border-radius: 3px;
        }
        pre {
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
          background-color: #f6f8fa;
          border-radius: 3px;
        }
        blockquote {
          padding: 0 1em;
          color: #6a737d;
          border-left: .25em solid #dfe2e5;
          margin: 0 0 16px 0;
        }
        ul, ol { padding-left: 2em; margin-bottom: 16px; }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 16px;
        }
        table th, table td {
          padding: 6px 13px;
          border: 1px solid #dfe2e5;
        }
        table tr:nth-child(even) {
          background-color: #f6f8fa;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .qr-container {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
        }
        .qr-container img {
          max-width: 400px;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="logo-container">
          <img src="https://mingcheng.aliensoft.com.cn/images/logo2.jpg" alt="智慧树知识产权团队" />
        </div>
        ${htmlContent}
        <div class="qr-container">
          <img src="https://mingcheng.aliensoft.com.cn/images/mcqr.jpg" alt="二维码" />
        </div>
      </div>
    </body>
    </html>
  `
  
  const formData = new FormData()
  formData.append('apiUser', process.env.NEXT_PUBLIC_SENDCLOUD_API_USER!)
  formData.append('apiKey', process.env.NEXT_PUBLIC_SENDCLOUD_API_KEY!)
  formData.append('from', process.env.NEXT_PUBLIC_SENDCLOUD_FROM_EMAIL!)
  formData.append('fromName', process.env.NEXT_PUBLIC_SENDCLOUD_FROM_NAME!)
  formData.append('subject', subject)
  formData.append('html', styledHtml)
  formData.append('to', type === 'single' ? emails[0] : emails.join(';'))

  try {
    const response = await fetch('https://api.sendcloud.net/apiv2/mail/send', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    return NextResponse.json({
      success: result.result === true,
      message: result.message || '发送成功'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '邮件发送服务不可用' },
      { status: 500 }
    )
  }
}