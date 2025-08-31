#!/bin/bash

# 科研资讯推送管理系统部署脚本
# 目标服务器：alixr
# 目标目录：/root/tmp/example_ui
# 端口：9010

echo "🚀 开始部署科研资讯推送管理系统..."

# 服务器配置
SERVER="alixr"
TARGET_DIR="/root/tmp/example_ui"
PORT="9010"

# 创建目标目录
echo "📁 创建目标目录..."
ssh $SERVER "mkdir -p $TARGET_DIR"

# 上传文件
echo "📤 上传项目文件..."
scp -r . $SERVER:$TARGET_DIR/

# 在服务器上执行部署
echo "🔧 在服务器上安装依赖并启动服务..."
ssh $SERVER << EOF
    cd $TARGET_DIR
    
    # 检查Python环境
    echo "🐍 检查Python环境..."
    python3 --version
    
    # 安装依赖
    echo "📦 安装Python依赖..."
    pip3 install -r requirements.txt
    
    # 停止可能存在的旧服务
    echo "🛑 停止旧服务..."
    pkill -f "python.*app.py.*9010" || true
    
    # 设置文件权限
    chmod +x app.py
    chmod +x deploy.sh
    
    # 启动服务
    echo "🚀 启动Flask应用..."
    nohup python3 app.py > app.log 2>&1 &
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if pgrep -f "python.*app.py" > /dev/null; then
        echo "✅ 服务启动成功！"
        echo "🌐 访问地址：http://\$(hostname -I | awk '{print \$1}'):$PORT"
        echo "📝 日志文件：$TARGET_DIR/app.log"
    else
        echo "❌ 服务启动失败，请检查日志"
        tail -20 app.log
    fi
EOF

echo "🎉 部署完成！"
echo ""
echo "📋 部署信息："
echo "   服务器：$SERVER"
echo "   目录：$TARGET_DIR"
echo "   端口：$PORT"
echo ""
echo "🔍 检查服务状态："
echo "   ssh $SERVER 'cd $TARGET_DIR && tail -f app.log'"
echo ""
echo "🌐 访问网站："
echo "   http://服务器IP:$PORT"
