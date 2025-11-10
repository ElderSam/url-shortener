
## Description
A url shortener made with NestJS.

## Project setup

### 1. Environment Variables
Copy the `.env.example` file to `.env`:
```bash
$ cp .env.example .env
```

Update the values in `.env`. 

### 2. Install Dependencies
```bash
$ pnpm install
```

### 3. Start Docker Services
The database and user will be created automatically:
```bash
$ docker-compose up -d
```

#### Logs
##### App logs
`$ docker-compose logs app --follow`

##### Db logs
`$ docker-compose logs db --follow`


### 4. Run Prisma Migrations
```bash
$ pnpm prisma migrate dev
```

## Compile and run the project (if you are not using Docker)

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## API Documentation (Swagger / OpenAPI)
This project uses Swagger (OpenAPI) for automatic API documentation.

### How to access
- Start the application (see above)
- Open your browser and go to: [http://localhost:3000/api](http://localhost:3000/api)

You will see an interactive UI to explore and test all API endpoints.

### How it works
- All controllers and routes are automatically documented.
- DTOs (request/response objects) are described if you use NestJS and Swagger decorators.
- The documentation updates automatically when you add new routes/controllers.

### Customizing documentation

#### Swagger Documentation

All API documentation is in the `swagger.json` file at the project root.
Update `swagger.json` whenever you add or change a route.

Official docs:
- https://docs.nestjs.com/openapi/introduction

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```


## Prisma
If you just want to test the project, you only need to run:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

This will create the database and generate the Prisma client automatically. You do not need to change the schema or run any other commands unless you want to modify the data model.


## Prettier & ESLint
Explanation of the scripts:

``format:check``: checks formatting without modifying files  
``lint:check``: checks lint without automatic fixes and fails if there are warnings  
``code:check``: runs both checks (useful for CI)  
``code:fix``: formats and automatically fixes issues  

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
