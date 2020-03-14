build-image:
	docker build . -t flynnlee/branch-switcher
publish: build-image
	docker push flynnlee/branch-switcher