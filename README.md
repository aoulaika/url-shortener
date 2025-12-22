## Project setup

```bash
$ pnpm install
```

## Compile and run the project
```bash
cp .env.example .env
```

```bash

# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Or
```
make build

# then
make up
```

## HTTP calls
```
# shorten a URL
curl -s -X POST http://localhost:3000/shorten --json '{"longUrl":"https://www.google.com"}' | jq

# Get redirected to long URL
curl -i http://localhost:3000/C9J83O1

# Get stats
curl -s http://localhost:3000/stats/C9J83O1 | jq
```

## URL Shortener API docs
http://localhost:3000/api

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
