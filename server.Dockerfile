FROM node:16 as base
ENV DOCKER_CONTAINER_ENV true

FROM base as production

WORKDIR /app/environment
COPY ./environment/package*.json .
RUN npm install
COPY ./environment .

WORKDIR /app/commons
COPY ./commons/package*.json .
RUN npm install
COPY ./commons .
RUN npm run modules:build

WORKDIR /app/cookbook-server
COPY ./cookbook-server/package*.json .
RUN npm install
COPY ./cookbook-server .

ENV NODE_ENV production

RUN npm run server:build
CMD ["npm", "run", "server:start"]


FROM base as development

ENV NODE_ENV development

WORKDIR /app/cookbook-server
RUN npm i --save bcrypt
CMD [ "npm", "run", "dev:server:watches" ]
