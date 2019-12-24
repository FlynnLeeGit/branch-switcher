# branch-switcher Docker 镜像

node 下开发
现阶段需要配合nginx进行调试
nginx 配置参考 nginx.conf

```shell
npm run dev
```

### 原理

通过查找配置文件中的 webroot 和 webroot_branches 目录下的文件夹来遍历出分支文件夹名称 供 ui 下拉选择使用

分支切换工具 docker 镜像

```
docker run -p 3030:3030 -v apps.json:/data/conf/apps.json hub.styd.cn/branch-switcher
```

apps.json 为配置文件

```json
{
  "demo": {
    // 项目名称 通过 http://localhost:3030/app/demo 访
    "default_branch": "test", // 默认使用分支
    "webroot_branches": "/data/htdocs/oa_frontend_branches" // 多分支用的根目录
  }
}
```

### 使用

- nginx 配置 参考./nginx.conf
- 和 gitlab 分支删除对应 `/app/:app_name/gitlab`
