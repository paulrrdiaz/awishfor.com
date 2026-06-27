# Local Testing

## Auth

Local dashboard and wizard testing requires a Clerk user session. Do not commit
real email/password pairs to this repository, including this docs folder.

If password sign-in accepts the credentials but remains on `/sign-in`, inspect
the Clerk sign-in status. A `needs_client_trust` status means Clerk Client Trust
is enabled and the browser must complete a second-factor trust challenge before
a session can be created. For local agent testing, either disable Client Trust in
the Clerk development instance or implement the custom sign-in flow for
`needs_client_trust`.

For agent-driven browser testing, use a local-only credential store such as the
`agent-browser` auth vault and name the entry `awishfor-local`. If credentials
are rotated or unavailable, ask the repository owner for the current local test
account.

```bash
agent-browser auth save awishfor-local --url http://localhost:4000/sign-in --username <email> --password-stdin
agent-browser auth login awishfor-local
```

Keep any copied credentials in ignored local files only, such as `.env` or
`.env.local`; never add them to tracked docs or source files.
