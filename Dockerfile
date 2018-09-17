FROM hub.styd.cn/node:sr-8.12.0

WORKDIR /app
COPY . /app

RUN cnpm install

CMD ["npm","start"]