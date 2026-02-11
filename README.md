# ctx4.ai

Your portable context layer for Claude & ChatGPT

## Development

1. Copy `.env.example` to `.env.local` and add your Supabase credentials from [dashboard](https://supabase.com/dashboard/project/_/settings/api)
2. Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Auth (Magic Link)

Magic link auth is configured. To make it work:

In Supabase Dashboard → **Authentication** → **URL Configuration**:
- Set **Site URL** to `http://localhost:3000` (or your production URL)
- Add `http://localhost:3000/auth/confirm` to **Redirect URLs**

## MCP Server with OAuth 2.1 Authorization

This project includes an MCP (Model Context Protocol) server with full OAuth 2.1 authorization support.

### Setup OAuth 2.1

1. In Supabase Dashboard → **Authentication** → **OAuth Server**:
   - Enable **OAuth 2.1 Server**
   - Set **Authorization Path** to: `/auth/oauth/authorize`
   - (Optional) Enable **Dynamic Client Registration** to allow MCP clients to self-register
     - With dynamic registration, clients provide their own redirect URIs during registration
     - Without it, you'll need to manually register each OAuth client in the dashboard

2. Add environment variables to `.env`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Connecting an MCP Client

1. In your MCP client (e.g., VS Code), add the server:
   ```json
   {
     "mcp.servers": {
       "ctx4-ai": {
         "url": "http://localhost:3000/sse",
         "type": "http"
       }
     }
   }
   ```

2. The client will automatically:
   - Discover OAuth configuration from Supabase
   - Register itself dynamically
   - Open browser for user authorization
   - Exchange tokens and make authenticated requests

### Available Tools

- **roll_dice**: Roll a dice with a specified number of sides (authenticated)

### Testing

```bash
# Test OAuth discovery
curl https://YOUR_PROJECT.supabase.co/.well-known/oauth-authorization-server/auth/v1

# Test Protected Resource Metadata
curl http://localhost:3000/.well-known/oauth-protected-resource

# Test unauthenticated request (should return 401)
curl -v -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

## Learn More

- [Supabase OAuth 2.1 Server](https://supabase.com/docs/guides/auth/oauth-server)
- [MCP Authorization Specification](https://modelcontextprotocol.io/specification/draft/basic/authorization)
- [Next.js Documentation](https://nextjs.org/docs)
