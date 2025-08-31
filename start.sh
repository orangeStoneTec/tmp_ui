#!/bin/bash

# 简单的启动脚本
echo "🚀 启动科研资讯推送管理系统..."

# 停止旧服务
pkill -f "python.*app.py.*9010" || true

# 启动新服务
nohup python3 app.py > app.log 2>&1 &

# 等待启动
sleep 2

# 检查状态
if pgrep -f "python.*app.py" > /dev/null; then
    echo "✅ 服务启动成功！"
    echo "🌐 访问地址：http://$(hostname -I | awk '{print $1}'):9010"
    echo "📝 查看日志：tail -f app.log"
else
    echo "❌ 服务启动失败"
    echo "📝 错误日志："
    tail -10 app.log
fi
