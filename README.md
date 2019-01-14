# smtp2webhook

## 使用说明

### 安装node.js，开发时用的版本是10.14.2，其他版本应该问题不大。

推荐从 https://nodejs.org 下载，并安装到/opt目录

### 安装依赖

    $ cd path_to_repo
    $ npm i

### 修改配置文件config.js

根据需要修改就好

### 修改域名记录

在直接指向域名的mx记录之前，需要先添加域名的a记录。这里以aaa.com为例。

将mx1.aaa.com, mx2.aaa.com, mx3.aaa.com等分别指向负载均衡里的每一台机器。

然后创建aaa.com的多条mx记录，分别指向mx1.aaa.com, mx2.aaa.com, ...

### 运行服务器

    $ cd path_to_repo
    $ node app.js

