# 项目名
NAME = branch_switcher
# 目标主机内容存放目录
CONTENT_PATH = /data/release_v2
# 目标主机 web 服务目录
HTDOCS_PATH = /data/htdocs

build-image:
	docker build . -t hub.styd.cn/branch-switcher
push-image:
	docker push hub.styd.cn/branch-switcher