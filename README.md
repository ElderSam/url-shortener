
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
- Use decorators like `@ApiTags`, `@ApiProperty`, `@ApiResponse` in your controllers and DTOs for richer docs.
- See the [NestJS Swagger docs](https://docs.nestjs.com/openapi/introduction) for advanced usage.

### Example
```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
	@ApiOperation({ summary: 'Login user' })
	@Post('login')
	login(@Body() loginDto: LoginDto) {
		// ...
	}
}
```

This will show up in Swagger UI under the "auth" tag.

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
### create prisma files: 
`pnpm prisma init`

### Generate Prisma client
`pnpm prisma generate`

### Create first migration
`pnpm prisma migrate dev --name init`


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
