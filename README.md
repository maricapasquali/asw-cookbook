# CookBook

CookBook is a web app for those who love to cook and/or eat healthy.
The platform aims to offer the exchange of recipes (traditional or customized) of all sorts of food (appetizers, first courses, main courses, desserts, drinks, condiments, ...)

# Using Docker

**Note: In this case database is hosted in _a container_.**

## Build _Image_

- _production_ mode
  ```
      docker-compose -f ./prod.docker-compose.yml build
  ```
- _development_ mode
  ```
      docker-compose -f ./dev.docker-compose.yml build
  ```

## Create and Run _Containers_

- _production_ mode

  ```
     docker-compose -f ./prod.docker-compose.yml up -d
  ```

- _development_ mode
  ```
     docker-compose -f ./dev.docker-compose.yml up -d
  ```
  - To populate database, look at the [_**Database Population (Example)**_](#database-population-example)

## Inspects

```
   docker-compose logs <name-of-service> -f
```

## Stop and Destroy _Containers_

- _production_ mode

  ```
     docker-compose -f ./prod.docker-compose.yml down -v
  ```

- _development_ mode
  ```
     docker-compose -f ./dev.docker-compose.yml down -v
  ```

# Using NPM

**Note**: In this case database is hosted in _localhost_. After installation and building to populate database, look at the [_**Database Population (Example)**_](#database-population-example).

## Installation

```
npm install
```

## Build and Run

- _production_ mode

  ```
  npm run build
  ```

  ```
  npm run start:server
  ```

  ```
  npm run start:client
  ```

- _development_ mode
  ```
  npm run dev:server
  ```
  ```
  npm run dev:client
  ```

# Database Population (Example)

**Note**: In _**production mode**_ using _**Docker**_, it is populated directly to the building of the image.

Requirement: [_mongorestore_](https://www.mongodb.com/try/download/database-tools) (mongodb tools)

```
  mongorestore --uri <database-uri-connection> --archive=./data/db-example.archive
```

Using _**Docker**_ : `<database-uri-connection> = mongodb://localhost:27018`

# Report

https://www.overleaf.com/read/twbtftypgyyy
