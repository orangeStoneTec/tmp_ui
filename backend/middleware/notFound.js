const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `未找到路由: ${req.method} ${req.originalUrl}`
    });
};

module.exports = notFound;