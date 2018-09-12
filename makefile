build-image:
	docker build . -t hub.styd.cn/branch-switcher
push-image:
	docker push hub.styd.cn/branch-switcher