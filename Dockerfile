FROM flynnlee/node:8.12.0

WORKDIR /app
COPY . /app

RUN cnpm install

CMD ["npm","start"]