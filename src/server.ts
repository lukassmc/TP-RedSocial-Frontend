import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Simple proxy for API requests when running the SSR server.
 * It forwards any request starting with /api to the backend defined by
 * the API_URL environment variable (for example https://api-tuapp.onrender.com).
 * If API_URL is not set, it falls back to http://localhost:3000.
 */
app.use('/api', async (req, res) => {
  try {
    const backendBase = process.env['API_URL'] || 'http://localhost:3000';
    const target = backendBase.replace(/\/$/, '') + req.originalUrl; // keep path

    const fetchOptions: any = {
      method: req.method,
      headers: { ...req.headers },
      redirect: 'manual'
    };

    // Remove host header to avoid conflicts
    delete fetchOptions.headers.host;

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req;
    }

    const upstream = await fetch(target, fetchOptions);

    // copy status
    res.status(upstream.status);

    // copy headers
    upstream.headers.forEach((value, name) => {
      // skip hop-by-hop headers
      if (["connection", "keep-alive", "transfer-encoding", "upgrade"].includes(name.toLowerCase())) return;
      res.setHeader(name, value);
    });

    // pipe body
    const body = await upstream.arrayBuffer();
    res.send(Buffer.from(body));
  } catch (err) {
    console.error('API proxy error:', err);
    res.status(502).send('Bad Gateway');
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
