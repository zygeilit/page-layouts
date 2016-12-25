
var connect = require('connect');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();
var fs = require('fs');
var util = require('util');
var path = require('path');
var serveStatic = require('serve-static')

var port = 8080;

// 承载页
dispatcher.onGet('/', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    fs.readFile('./app/index.html', null, function(error, data){
        if(error) {
            res.writeHead(404);
            res.write('File not fount!');
        } else {
            res.write(data);
        }
        res.end();
    });
});

dispatcher.onGet('/svg-arrow', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    fs.readFile('./app/svg-arrow.html', null, function(error, data){
        if(error) {
            res.writeHead(404);
            res.write('File not fount!');
        } else {
            res.write(data);
        }
        res.end();
    });
});

(new connect())

    // 输出请求连接
    .use(function logger(req, res, next) {
        console.log('%s %s', req.method, req.url);
        next();
    })

    // 返回资源文件
    .use(function staticFiles(req, res, next) {
        var filePath = '.' + req.url;
        var extname = path.extname(filePath);
        var contentType = '';
        var isStaticFile = false;
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                isStaticFile = true;
                break;
            case '.css':
                contentType = 'text/css';
                isStaticFile = true;
                break;
            case '.png':
            case '.jpg':
            case '.gif':
                contentType = 'image/' + extname.replace('\.', '');
                isStaticFile = true;
                // 提出images 里面的style
                filePath = filePath.replace(/styles\//, '');
                break;
            default: break;
        }
        if(isStaticFile) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    res.writeHead(404);
                    res.write('File not fount!');
                }
                else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
                res.end();
            });
        } else {
            next();
        }
    })

    // 接口路由
    .use(function interfaces(req, res, next) {
        dispatcher.dispatch(req, res);
    })

    .listen(port)