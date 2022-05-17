FROM node:16 as base

ENV DOCKER_CONTAINER_ENV true

ENV NODE_ENV development

WORKDIR /app


FROM base as client

CMD [ "npm", "run", "dev:client" ]

FROM base as server

CMD [ "npm", "run", "dev:server" ]

