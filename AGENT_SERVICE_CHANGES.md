# NestJS Agent Service Changes (Repo 1)

Apply these changes in your separate NestJS agent repository.

## 1) Enable CORS for Next.js app

In `src/main.ts`:

```ts
await app.listen(process.env.PORT ?? 4000);
```

and add:

```ts
app.enableCors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: false
});
```

## 2) DTO validation for `/agent/marketplace`

Create `src/agent/dto/marketplace-search.dto.ts`:

```ts
import { IsString, MinLength } from 'class-validator';

export class MarketplaceSearchDto {
  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(2)
  service: string;
}
```

Controller example:

```ts
@Post('marketplace')
searchMarketplace(@Body() dto: MarketplaceSearchDto) {
  return this.agentService.searchMarketplace(dto);
}
```

## 3) Consistent response shape

Return:

```json
{
  "service": "CAR_MECHANIC",
  "city": "Bugojno",
  "results": [
    { "name": "Provider A", "distance": 1.2, "source": "OSM" }
  ]
}
```

## 4) Validation pipe

In `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  })
);
```
