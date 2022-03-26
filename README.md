# CookBook

CookBook is a web app for those who love to cook and/or eat healthy.
The platform aims to offer the exchange of recipes (traditional or customized) of all sorts of food (appetizers, first courses, main courses, desserts, drinks, condiments, ...)

##Database Installation
//TODO: create scripts for database population ..

# Using Docker 
**Note: In this case database is hosted in _a container_.**
## Create Image and Build Container
- _production_ mode
    ````
        docker-compose build .
    ````
- _development_ mode
    ````
        docker-compose -f ./docker-compose.dev.yml build
    ````

## Run Containers
- _production_ mode
    ````
       docker-compose up -d
    ````

- _development_ mode
    ````
       docker-compose -f ./docker-compose.dev.yml up -d
    ````

## Inspects
````
   docker-compose logs <name-of-service> -f
````

## Stop and Destroy Containers
- _production_ mode
    ````
       docker-compose down
    ````

- _development_ mode
    ````
       docker-compose -f ./docker-compose.dev.yml down
    ````

# Using Node and NPM
**Note: In this case database is hosted in _localhost_.**
## Installation
````
npm run install:sub-projects
````
## Build and Run
- _production_ mode

  ````
  npm run build
  ````
 
  ````
  npm run server:start
  ````
  
  ````
  npm run client:start
  ````

- _development_ mode
  ````
  npm run dev:server:start
  ````
  ````
  npm run dev:client:start
  ````


## Report
https://www.overleaf.com/project/610d78bf0f3d25865977099f
