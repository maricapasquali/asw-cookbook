FROM mongo as production

COPY ./data/cookbook.archive /data

RUN mongod --fork --logpath /var/log/mongodb.log && mongorestore --archive=/data/cookbook.archive && mongod --shutdown

CMD docker-entrypoint.sh mongod
