# cat-api

This repository is a demo platform to show how [Workers for platfroms](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms) can be used.

## Live Demo

👩‍💻 Developer protal [https://cat-frontend.pages.dev/ide/](https://cat-frontend.pages.dev/ide/)

🏢 Admin portal [https://cat-frontend.pages.dev/admin/](https://cat-frontend.pages.dev/admin/)

## Set Up

Clone the project:

```sh
git clone git@github.com:megaconfidence/cat-api.git
```

Install project dependencies:

```sh
cd cat-api/
npm i
```

Create a `.dev.vars` file with the following content:

```sh
DISPATCH_NAMESPACE_ACCOUNT_ID=your_id_here
DISPATCH_NAMESPACE_API_TOKEN=your_token_here
```

> For `DISPATCH_NAMESPACE_ACCOUNT_ID`, go to Workers for platform dashboard and copy your Account ID on the right sidebar.

> For `DISPATCH_NAMESPACE_API_TOKEN`, go to Workers & Pages dashboard > click "Manage API tokens" on right sidebar. Click "Create A Token" and use the "Edit Cloudflare Workers" template.

Create a dispatch namespace:

```sh
npx wrangler dispatch-namespace create cat-app
```

Add the following binding to `wrangler.toml`:

```toml
[[dispatch_namespaces]]
binding = "dispatcher"
namespace = "cat-api"
```

Run the following commands to create the required KV namespaces:

```sh
npx wrangler kv:namespace create customers
npx wrangler kv:namespace create customers --preview
npx wrangler kv:namespace create scripts
npx wrangler kv:namespace create scripts --preview
```

Replace the values of `kv_namespaces` in the `wrangler.toml` file with the output of the last command:

```toml
kv_namespaces = [
{ binding = "customers", id = "your_id_here", preview_id = "your_preview_id_here" },
{ binding = "scripts", id = "your_id_here", preview_id = "your_preview_id_here" }
]
```

Finally, run the app:

```sh
npx wrangler dev --remote
```

> Note that as at when this project was written, Dispatch namespaces is only supported in remote and not local dev
> i.e always use `npx wrangler dev --remote`
