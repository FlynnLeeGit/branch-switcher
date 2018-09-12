FROM hub.styd.cn/node:base

WORKDIR /app
COPY . /app

RUN cnpm install

CMD ["npm","start"]

