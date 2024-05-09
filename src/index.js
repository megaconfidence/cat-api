import { Hono } from 'hono';
import {
	getCustomerScripts,
	getScriptsInDispatchNamespace,
	getTagsOnScript,
	putInDispatchNamespace,
	putTagsOnScript,
	setCustomer,
} from './utils';

const app = new Hono();

app.post('/api/signin', async (c) => {
	const { name, plan } = await c.req.json();
	await c.env.customers.put(name, JSON.stringify({ name, plan }));
	return c.json({ name }, 201);
});

app.put('/api/script/:name', setCustomer, async (c) => {
	const scriptName = c.req.param('name');
	const customer = c.var.customer;

	const tags = await getTagsOnScript(c.env, scriptName);
	if (tags.length > 0 && !tags.includes(customer.name)) {
		return c.text('Script name is reserved', 409);
	}
	//create or update script
	const body = await c.req.json();
	const putRes = await putInDispatchNamespace(c.env, scriptName, body.script);
	if (!putRes.ok) return c.text(await putRes.text(), 500);

	console.log('here');
	//add user info to script
	const tagRes = await putTagsOnScript(c.env, scriptName, [customer.name, customer.plan]);
	if (!tagRes.ok) return c.text(await tagRes.text(), 500);

	//custom script limits
	const limits = customer.plan === 'basic' ? { cpuMs: 10, memory: 10 } : {};
	const outbound = { outbound_script_id: null };
	await c.env.scripts.put(scriptName, JSON.stringify({ limits, outbound }));

	return c.text('Purrfect!', 201);
});

app.get('/api/dispatch/:name', async (c) => {
	const scriptName = c.req.param('name');
	const scriptConfig = JSON.parse(await c.env.scripts.get(scriptName));
	const workerArgs = {};

	const worker = c.env.dispatcher.get(scriptName, workerArgs, scriptConfig);
	return worker.fetch(c.req.raw);
});

app.get('/api/script', setCustomer, async (c) => {
	const scripts = await getCustomerScripts(c.env, c.var.customer.name);
	return c.json(scripts);
});

app.get('/api/dispatch', async (c) => {
	const data = await getScriptsInDispatchNamespace(c.env);
	return c.json({ name: c.env.DISPATCH_NAMESPACE_NAME, data });
});

export default app;
