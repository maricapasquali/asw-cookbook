FROM mongo as production

COPY ./data/cookbook.archive /data

ADD ./data/init.sh /docker-entrypoint-initdb.d

CMD docker-entrypoint.sh mongod
