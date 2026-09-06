# Security policy

## Supported versions

Security fixes for the public `0.x` line land on `main` and the latest published versions of `@agentstride/core` and `@agentstride/openai`.

## Reporting a vulnerability

**Do not** open a public issue for security reports that include exploit details.

1. Prefer [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories) when the repository is public.  
2. Otherwise, report privately to the repository owner.

Include: affected package/version, description, reproduction steps, and impact.

## Secrets

- Never commit API keys, tokens, or production credentials.  
- Use `.env.example` as the template; keep real `.env` local and gitignored.  
- Rotate any key that may have been exposed.
