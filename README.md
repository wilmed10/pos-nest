# POS - API (NestJS)

Backend REST API for a point-of-sale system. Handles products, categories, coupons and transactions, with image upload to Cloudinary. Built with NestJS, TypeORM and PostgreSQL.

Consumed by [posfront](../posfront), deployed at [pos-front-beta.vercel.app](https://pos-front-beta.vercel.app/).

## Stack

- NestJS 11 + Express
- TypeORM + PostgreSQL
- class-validator / class-transformer for DTO validation
- Cloudinary for product image storage
- Jest + Supertest for unit/e2e tests
- Docker + Traefik for deployment

## Modules

- `categories` - CRUD for product categories
- `products` - CRUD for products, listing with pagination (`take`/`skip`)
- `transactions` - order/sale creation and querying by date
- `coupons` - coupon creation and apply-coupon logic
- `upload-image` - Cloudinary upload handling
- `seeder` - seeds categories/products for local development

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```
PORT=3001
NODE_ENV=development

DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USER=
DATABASE_PASS=
DATABASE_NAME=

CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Running

```bash
# development (watch mode)
npm run start:dev

# production build
npm run build
npm run start:prod
```

Seed the database with sample categories/products:

```bash
npm run seed
```

## Tests

```bash
npm run test        # unit
npm run test:e2e    # e2e
npm run test:cov    # coverage
```

## Docker

```bash
docker compose up -d --build
```

The compose file assumes an external `proxy` network with Traefik and routes `apipos.wilsonmedina.online` to the container's port 3001.
