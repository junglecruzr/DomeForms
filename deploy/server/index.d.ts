/**
 * DomeForms API Server
 * Fastify-based REST API with WebSocket support
 */
import Fastify from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
declare const fastify: Fastify.FastifyInstance<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, Fastify.FastifyBaseLogger, ZodTypeProvider>;
export { fastify };
//# sourceMappingURL=index.d.ts.map