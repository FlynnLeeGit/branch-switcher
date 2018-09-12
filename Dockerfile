FROM hub.styd.cn/node:base

WORKDIR /data
COPY . /data

RUN cnpm install

CMD ["npm","start"]