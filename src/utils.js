export const setCustomer = async (c, next) => {
	const authHeader = 'X-Customer-Name';
	const name = c.req.header(authHeader);
	if (!name) return c.text(`${authHeader} header not set`, 403);

	const customer = JSON.parse(await c.env.customers.get(name));
	if (!customer) return c.text(`Unauthorized ${authHeader}`, 403);
	c.set('customer', customer);
	await next();
};

const baseURI = (env) => `https://api.cloudflare.com/client/v4/accounts/${env.DISPATCH_NAMESPACE_ACCOUNT_ID}/workers`;
const scriptsURI = (env) => `${baseURI(env)}/dispatch/namespaces/${env.DISPATCH_NAMESPACE_NAME}/scripts`;
const makeHeaders = (env) => ({ Authorization: `Bearer ${env.DISPATCH_NAMESPACE_API_TOKEN}` });

export const getTagsOnScript = async (env, scriptName) => {
	const res = await fetch(`${scriptsURI(env)}/${scriptName}/tags`, {
		method: 'get',
		headers: makeHeaders(env),
	});
	return (await res.json()).result || [];
};

export const putInDispatchNamespace = async (env, scriptName, scriptContent) => {
	const form = new FormData();
	const scriptFileName = `${scriptName}.mjs`;

	form.append('script', new File([scriptContent], scriptFileName, { type: 'application/javascript+module' }));

	const metadata = { main_module: scriptFileName };
	form.append('metadata', new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }));

	//dynamically inject a platform moudle
	const platformModule = 'export const meow = "Meow meow.";';
	form.append('platform_module', new File([platformModule], 'platform_module.mjs', { type: 'application/javascript+module' }));

	return await fetch(`${scriptsURI(env)}/${scriptName}`, {
		method: 'put',
		body: form,
		headers: makeHeaders(env),
	});
};

export const putTagsOnScript = async (env, scriptName, tags) => {
	return await fetch(`${scriptsURI(env)}/${scriptName}/tags`, {
		method: 'put',
		body: JSON.stringify(tags),
		headers: { 'Content-Type': 'application/json', ...makeHeaders(env) },
	});
};

export const getCustomerScripts = async (env, name) => {
	const res = await fetch(`${scriptsURI(env)}?tags=${name}:yes`, {
		method: 'get',
		headers: makeHeaders(env),
	});

	return (await res.json()).result;
};

export const getScriptsInDispatchNamespace = async (env) => {
	const res = await fetch(scriptsURI(env), {
		method: 'get',
		headers: makeHeaders(env),
	});
	return (await res.json()).result;
};
