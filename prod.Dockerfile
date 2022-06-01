FROM node:16 as base

ENV DOCKER_CONTAINER_ENV true

WORKDIR /app

COPY ./package*.json ./

COPY ./tsconfig.json .

COPY ./cookbook-shared ./cookbook-shared


FROM base as client

COPY ./cookbook-app ./cookbook-app

RUN npm install

ENV NODE_ENV production

RUN npm run build

CMD [ "npm", "run", "start:client" ]

FROM base as server

COPY ./cookbook-server ./cookbook-server

RUN npm install

WORKDIR /app/cookbook-server

RUN npm run postinstall

ENV NODE_ENV production

WORKDIR /app

RUN npm run build

CMD [ "npm", "run", "start:server" ]


FROM mongo as database

COPY ./data/db-example.archive /data

ADD ./data/init.sh /docker-entrypoint-initdb.d

CMD docker-entrypoint.sh mongod
