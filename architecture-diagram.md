# Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                    │
│  │   Browser    │   │  Mobile App  │   │  API Client  │                    │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                    │
└─────────┼──────────────────┼──────────────────┼──────────────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    HTTP/HTTPS Requests
                             │
┌─────────────────────────────┼──────────────────────────────────────────────┐
│                    NESTJS APPLICATION                                        │
│                             │                                                │
│  ┌──────────────────────────▼────────────────────────────────────────────┐ │
│  │                    CONTROLLERS LAYER                                   │ │
│  │                                                                        │ │
│  │  ┌─────────────────┐              ┌──────────────────────────────┐   │ │
│  │  │ AuthController  │              │   ShortenController          │   │ │
│  │  ├─────────────────┤              ├──────────────────────────────┤   │ │
│  │  │ POST /register  │              │ POST /shorten                │   │ │
│  │  │ POST /login     │              │ GET /:short (redirect)       │   │ │
│  │  └────────┬────────┘              │ GET /my-urls                 │   │ │
│  │           │                       │ PUT /my-urls/:id             │   │ │
│  └───────────┼───────────────────────│ DELETE /my-urls/:id          │───┘ │
│              │                       └─────────────┬────────────────┘     │
│              │                                     │                       │
│  ┌───────────▼─────────────────────────────────────▼───────────────────┐ │
│  │                    MIDDLEWARE & GUARDS                               │ │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐    │ │
│  │  │  AuthGuard   │  │ RateLimitGuard  │  │ OptionalAuthMiddle │    │ │
│  │  │  (JWT)       │  │                 │  │      ware          │    │ │
│  │  └──────┬───────┘  └────────┬────────┘  └──────────┬─────────┘    │ │
│  └─────────┼─────────────────────┼─────────────────────┼──────────────┘ │
│            │                     │                     │                  │
│  ┌─────────▼─────────────────────▼─────────────────────▼──────────────┐ │
│  │                      SERVICES LAYER                                 │ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐    │ │
│  │  │ AuthService  │  │ ShortenService  │  │   UsersService    │    │ │
│  │  │  (bcrypt)    │  │                 │  │                   │    │ │
│  │  └──────┬───────┘  └────────┬────────┘  └──────────┬────────┘    │ │
│  │         │                   │                       │              │ │
│  │         │          ┌────────▼────────┐              │              │ │
│  │         │          │  SlugService    │              │              │ │
│  │         │          │  (Base62 Gen)   │              │              │ │
│  │         │          └─────────────────┘              │              │ │
│  └─────────┼──────────────────┼──────────────────────┬─┘              │ │
│            │                  │                      │                  │
└────────────┼──────────────────┼──────────────────────┼──────────────────┘
             │                  │                      │
             └──────────────────┴──────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────────┐
│                         DATA LAYER                                        │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      PRISMA ORM                                     │ │
│  │              (Type-safe Database Client)                            │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                               │                                           │
│  ┌────────────────────────────▼───────────────────────────────────────┐ │
│  │                     POSTGRESQL DATABASE                             │ │
│  │                                                                     │ │
│  │    ┌──────────────────┐           ┌──────────────────────────┐    │ │
│  │    │  User Table      │           │  ShortUrl Table          │    │ │
│  │    ├──────────────────┤           ├──────────────────────────┤    │ │
│  │    │ - id (UUID)      │           │ - id (UUID)              │    │ │
│  │    │ - email          │◄─────────┤│ - originalUrl            │    │ │
│  │    │ - password       │  ownerId  │ - slug (6 chars)         │    │ │
│  │    │ - createdAt      │           │ - alias (optional)       │    │ │
│  │    │ - updatedAt      │           │ - accessCount            │    │ │
│  │    └──────────────────┘           │ - ownerId (nullable)     │    │ │
│  │                                   │ - deletedAt (nullable)   │    │ │
│  │                                   │ - createdAt              │    │ │
│  │                                   │ - updatedAt              │    │ │
│  │                                   └──────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENTATION                                      │
│                                                                           │
│                    Swagger/OpenAPI at /docs                               │
│                  (Auto-generated from decorators)                         │
└───────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Request Flow**: Client → Controller → Guards/Middleware → Service → Prisma → Database
2. **Response Flow**: Database → Prisma → Service → Controller → Client
3. **Authentication**: JWT tokens validated by AuthGuard before accessing protected routes
4. **URL Shortening**: SlugService generates unique Base62 slugs (6 chars = 56B+ combinations)
5. **Soft Delete**: URLs marked with `deletedAt` timestamp instead of hard deletion

## Key Features

- **Stateless Authentication**: JWT-based, scalable across multiple instances
- **Atomic Operations**: Access count increments use database-level atomicity
- **Type Safety**: Prisma provides end-to-end type safety from DB to API
- **Docker Ready**: Containerized for easy deployment and scaling
