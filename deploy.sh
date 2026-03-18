#!/bin/bash

# AI Blog 部署脚本
# 用法: ./deploy.sh [项目目录]

set -e

# 支持传入项目目录参数，默认使用当前目录
PROJECT_DIR="${1:-$(cd "$(dirname "$0")" && pwd)}"
APP_NAME="ai-blog"
PORT=3000

echo "========================================"
echo "🚀 开始部署 AI Blog"
echo "========================================"

# 进入项目目录
cd "$PROJECT_DIR"
echo "📁 项目目录: $PROJECT_DIR"

# 加载 SSH 密钥（如果存在）
if [ -f ~/.ssh/github_key ]; then
  echo ""
  echo "🔑 加载 SSH 密钥..."
  eval "$(ssh-agent -s)" > /dev/null 2>&1
  ssh-add ~/.ssh/github_key 2>/dev/null || true
fi

# 暂存本地更改并拉取最新代码
echo ""
echo "⬇️  拉取最新代码..."
git stash 2>/dev/null || true
git fetch origin
git pull origin main
echo "✅ 代码已更新"

# 安装依赖
echo ""
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo ""
echo "🔨 构建项目..."
pnpm build

# 使用 PM2 管理进程
echo ""
echo "🔄 重启服务..."
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start pnpm --name "$APP_NAME" -- start
pm2 save

echo ""
echo "========================================"
echo "✨ 部署完成！"
echo "🌐 访问地址: http://localhost:$PORT"
echo "📊 查看状态: pm2 status"
echo "📋 查看日志: pm2 logs $APP_NAME"
echo "========================================"
