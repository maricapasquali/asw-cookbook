# CookBook

CookBook is a web app for those who love to cook and/or eat healthy.
The platform aims to offer the exchange of recipes (traditional or customized) of all sorts of food (appetizers, first courses, main courses, desserts, drinks, condiments, ...)

# Using Docker

**Note: In this case database is hosted in _a container_.**

## Build _Image_

- _production_ mode
  ```
      docker-compose build .
  ```
- _development_ mode
  ```
      docker-compose -f ./docker-compose.dev.yml build
  ```

## Create and Run _Containers_

- _production_ mode

  ```
     docker-compose up -d
  ```

- _development_ mode
  ```
     docker-compose -f ./docker-compose.dev.yml up -d
  ```
  - To populate database, look at the [_**Database Population (Example)**_](#database-population-example)

## Inspects

```
   docker-compose logs <name-of-service> -f
```

## Stop and Destroy _Containers_

- _production_ mode

  ```
     docker-compose down
  ```

- _development_ mode
  ```
     docker-compose -f ./docker-compose.dev.yml down
  ```

# Using NPM

**Note**: In this case database is hosted in _localhost_. After installation and building to populate database, look at the [_**Database Population (Example)**_](#database-population-example).

## Installation

```
npm run install:sub-projects
```

## Build and Run

- _production_ mode

  ```
  npm run build
  ```

  ```
  npm run server:start
  ```

  ```
  npm run client:start
  ```

- _development_ mode
  ```
  npm run dev:server:start
  ```
  ```
  npm run dev:client:start
  ```

# Database Population (Example)

**Note**: In _**production mode**_ using _**Docker**_, it is populated directly to the building of the image.

Requirement: [_mongorestore_](https://www.mongodb.com/try/download/database-tools) (mongodb tools)

```
  mongorestore --uri <database-uri-connection> --archive=./data/cookbook.archive
```

Using _**Docker**_ : `<database-uri-connection> = mongodb://localhost:27018`

# Report

https://www.overleaf.com/project/610d78bf0f3d25865977099f
