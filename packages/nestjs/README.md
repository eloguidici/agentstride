# @agentstride/nestjs

Optional NestJS integration.

```ts
AgentStrideModule.forRoot({
  model,
  tools,
})
```

The package returns a Nest-compatible dynamic module object without requiring `@nestjs/common` at build time for AgentStride itself. In a Nest app, install `@nestjs/common` and import `AgentStrideModule` as usual.
