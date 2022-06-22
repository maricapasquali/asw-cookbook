# CookBook

CookBook is a web app for those who love to cook and/or eat healthy.
The platform aims to offer the exchange of recipes (traditional or customized) of all sorts of food (appetizers, first courses, main courses, desserts, drinks, condiments, ...)

# Continuous Integration (CI)

[![Build](https://github.com/maricapasquali/asw-cookbook/actions/workflows/build.yml/badge.svg)](https://github.com/maricapasquali/asw-cookbook/actions/workflows/build.yml)
[![Test](https://github.com/maricapasquali/asw-cookbook/actions/workflows/test.yml/badge.svg)](https://github.com/maricapasquali/asw-cookbook/actions/workflows/test.yml)
[![ESLint + Stylelint](https://github.com/maricapasquali/asw-cookbook/actions/workflows/linter.yml/badge.svg)](https://github.com/maricapasquali/asw-cookbook/actions/workflows/linter.yml)
[![Production DockerCompose](https://github.com/maricapasquali/asw-cookbook/actions/workflows/production-compose.yml/badge.svg)](https://github.com/maricapasquali/asw-cookbook/actions/workflows/production-compose.yml)

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

# Using NPM v7 or later

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

### Some credentials

| userID       | password | role   |
|--------------|----------|--------|
| jason-admin  | admin    | admin  |
| Marica-admin | admin    | admin  |
| hannah-green | Ciao$111 | signed |
| marcoverdi   | Ciao$111 | signed |
| janedoe01    | CookBook#01# | signed |


# Report

https://www.overleaf.com/read/twbtftypgyyy
