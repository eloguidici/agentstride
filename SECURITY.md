# Security policy

## Supported versions

During private incubation and the first public `0.1.0` line, security fixes land on `main` / the latest published `0.x` of `@agentstride/core` and `@agentstride/openai`.

## Reporting a vulnerability

**Do not** open a public issue for security reports that include exploit details.

1. Prefer [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories) once the repository is public.  
2. Until then, report privately to the repository owner.

Include: affected package/version, description, reproduction steps, and impact.

## Secrets

- Never commit API keys, tokens, or production credentials.  
- Use `.env.example` as the template; keep real `.env` local and gitignored.  
- Rotate any key that may have been exposed.
