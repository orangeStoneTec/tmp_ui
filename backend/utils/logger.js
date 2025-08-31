const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 简单的日志实现
class Logger {
    constructor() {
        this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (data) {
            logMessage += ` ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`;
        }
        
        return logMessage;
    }

    writeLog(level, message, data = null) {
        const logMessage = this.formatMessage(level, message, data);
        
        // 输出到控制台
        if (level === 'error') {
            console.error(logMessage);
        } else if (level === 'warn') {
            console.warn(logMessage);
        } else {
            console.log(logMessage);
        }

        // 写入文件
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            console.error('日志写入失败:', error.message);
        }
    }

    debug(message, data) {
        if (process.env.NODE_ENV === 'development') {
            this.writeLog('debug', message, data);
        }
    }

    info(message, data) {
        this.writeLog('info', message, data);
    }

    warn(message, data) {
        this.writeLog('warn', message, data);
    }

    error(message, data) {
        this.writeLog('error', message, data);
    }
}

module.exports = new Logger();