# branch-switcher Docker 镜像


node 下开发

```shell
npm run dev
```

### 原理
通过查找配置文件中的 webroot 和 webroot_branches 目录下的文件夹来遍历出分支文件夹名称 供ui下拉选择使用

分支切换工具 docker 镜像

```
docker run -p 3030:3030 -v apps.json:/data/conf/apps.json hub.styd.cn/branch-switcher
```

apps.json 为配置文件

```json
{
  "demo": { // 项目名称 通过 http://localhost:3030/app/demo 访问
    "branch_key": "demo_branch", // Cookie的名称
    "webroot": "/data/htdocs/oa_frontend", // 默认nginx网站根目录
    "webroot_branches": "/data/htdocs/oa_frontend_branches" // 多分支用的根目录
  }
}
```
