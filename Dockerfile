FROM hub.styd.cn/node:base

WORKDIR /data
COPY . /data

RUN cnpm instal

CMD ["npm","start"]