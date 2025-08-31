#!/bin/bash

# 停止服务脚本
echo "🛑 停止科研资讯推送管理系统..."

# 查找并停止服务
PID=$(pgrep -f "python.*app.py.*9010")

if [ -n "$PID" ]; then
    echo "📍 找到进程 PID: $PID"
    kill $PID
    sleep 2
    
    # 确认停止
    if pgrep -f "python.*app.py.*9010" > /dev/null; then
        echo "⚠️  进程仍在运行，强制停止..."
        pkill -9 -f "python.*app.py.*9010"
    fi
    
    echo "✅ 服务已停止"
else
    echo "ℹ️  没有找到运行中的服务"
fi
