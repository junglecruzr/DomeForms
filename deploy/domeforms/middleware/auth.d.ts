/**
 * Authentication middleware
 */
import { FastifyInstance } from 'fastify';
export declare function authMiddleware(fastify: FastifyInstance): Promise<void>;
declare module 'fastify' {
    interface FastifyRequest {
        authUser: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        } | null;
        authOrganization: {
            id: string;
            name: string;
            slug: string;
        } | null;
        authMembership: {
            role: string;
            organizationId: string;
        } | null;
    }
}
//# sourceMappingURL=auth.d.ts.map