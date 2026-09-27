# Quickstart (no API key)

Complete quickstart example from the main README that runs without an API key.

Uses a fake model that demonstrates the full agent lifecycle:

1. Agent receives task
2. Model decides to call a tool
3. Tool executes and returns data
4. Model formats the final structured output

## Run

```bash
npm start -w @agentstride/example-quickstart-no-api-key
```

Expected output:

```
Status: completed
Output: { summary: 'Customer 42 (Ada) found successfully.' }
Duration: <x>ms
```

## Why this exists

This example proves that the quickstart code in the README works exactly as documented, including all imported dependencies (`zod` for structured output).

CI smoke-tests this example to ensure documentation accuracy.
