# Velum Grid — data-export / SAR gate

Compliance vertical for **Velum Grid** subject-access requests.

| Source | Team | Shape |
| --- | --- | --- |
| `idvault` | identity | JSON |
| `mailroom` | privacy | email-like text |
| `ledgerflare-pii` | payments | nested envelope |

Flow: normalize → acknowledge | proposeExport → external `privacy-officer` / `admin` approve.

```bash
npm start -w @agentstride/example-data-export
npm run start:http -w @agentstride/example-data-export
npm test -w @agentstride/example-data-export
npm run eval:data-export
```

Core unchanged. Repo stays private.
