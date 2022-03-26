FROM node:16 as base
ENV DOCKER_CONTAINER_ENV true

FROM base as production

WORKDIR /app
COPY ./docker-compose.yml .

WORKDIR /app/environment
COPY ./environment/package*.json .
RUN npm install
COPY ./environment .

WORKDIR /app/commons
COPY ./commons/package*.json .
RUN npm install
COPY ./commons .
RUN npm run modules:build

WORKDIR /app/cookbook-app
COPY ./cookbook-app/package*.json .
RUN npm install
COPY ./cookbook-app .

ENV NODE_ENV production

RUN npm run client:build:tsc
RUN npm run client:build:production
CMD [ "npm", "run", "client:start" ]


FROM base as development

ENV NODE_ENV development

WORKDIR /app/cookbook-app
CMD [ "npm", "run", "dev:client:watches" ]
