import { NextRequest, NextResponse } from 'next/server';

// 知识库访问密码 - 通过环境变量配置
// 请在 .env.local 中设置: KNOWLEDGE_PASSWORD=your_password
const KNOWLEDGE_PASSWORD = process.env.KNOWLEDGE_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    // 检查密码是否已配置
    if (!KNOWLEDGE_PASSWORD) {
      console.error('KNOWLEDGE_PASSWORD is not configured');
      return NextResponse.json({ error: '服务未正确配置，请联系管理员' }, { status: 500 });
    }

    const { password } = await req.json();

    if (password === KNOWLEDGE_PASSWORD) {
      const response = NextResponse.json({ success: true });
      // 设置 cookie，7天有效
      response.cookies.set('knowledge_auth', 'true', {
        httpOnly: true,
        secure: false, // 允许 HTTP 访问
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7天
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: '验证失败' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const isAuth = req.cookies.get('knowledge_auth')?.value === 'true';
  return NextResponse.json({ authenticated: isAuth });
}
