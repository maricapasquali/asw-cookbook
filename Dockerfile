FROM node:16 as base

ENV DOCKER_CONTAINER_ENV true

WORKDIR /app

FROM base as prod-base

COPY ./package*.json ./

COPY ./tsconfig.json .

COPY ./cookbook-shared ./cookbook-shared

FROM prod-base as prod-client

COPY ./cookbook-app ./cookbook-app

RUN npm install

ENV NODE_ENV production

RUN npm run build

RUN find ./cookbook-shared/* -not -path "./cookbook-shared/dist*" -delete

CMD [ "npm", "run", "start:client" ]

FROM prod-base as prod-server

COPY ./cookbook-server ./cookbook-server

RUN npm install

WORKDIR /app/cookbook-server

RUN npm run postinstall

ENV NODE_ENV production

WORKDIR /app

RUN npm run build

CMD [ "npm", "run", "start:server" ]

FROM mongo as prod-database
## todo: Decomment when adding the example database
#COPY ./data/db-example.archive /data

#ADD ./data/init.sh /docker-entrypoint-initdb.d

CMD docker-entrypoint.sh mongod

FROM base as dev-base

# Active Hot Reloading
ENV CHOKIDAR_USEPOLLING true

ENV NODE_ENV development

COPY . .

RUN npm install

WORKDIR /app/cookbook-server

RUN npm run postinstall

WORKDIR /app

FROM dev-base as dev-client

CMD [ "npm", "run", "dev:client" ]

FROM dev-base as dev-server

CMD [ "npm", "run", "dev:server" ]
