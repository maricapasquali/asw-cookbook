FROM node:16 as base
ENV DOCKER_CONTAINER_ENV true

FROM base as production

WORKDIR /app
COPY ./tsconfig.json .

WORKDIR /app/environment
COPY ./environment/package*.json ./
RUN npm install
COPY ./environment .

WORKDIR /app/shared
COPY ./shared/package*.json ./
RUN npm install
COPY shared .
RUN npm run build

WORKDIR /app/cookbook-server
COPY ./cookbook-server .
RUN npm install

ENV NODE_ENV production

RUN npm run build
CMD ["npm", "start"]


FROM base as development

ENV NODE_ENV development

WORKDIR /app/cookbook-server
RUN npm i --save bcrypt
CMD [ "npm", "run", "dev:server:watches" ]
