/**
 * Authentication middleware
 */
import { prisma } from '@domeforms/database';
export async function authMiddleware(fastify) {
    // Decorate request with user (using authUser to avoid conflict with Fastify's built-in user)
    fastify.decorateRequest('authUser', null);
    fastify.decorateRequest('authOrganization', null);
    fastify.decorateRequest('authMembership', null);
    fastify.addHook('preHandler', async (request, reply) => {
        // Skip auth for public routes
        const publicPaths = [
            '/health',
            '/docs',
            '/api/auth',
            '/api/forms/public',
            '/api/webhooks',
        ];
        if (publicPaths.some(p => request.url.startsWith(p))) {
            return;
        }
        // Skip for OPTIONS requests
        if (request.method === 'OPTIONS') {
            return;
        }
        try {
            // Verify JWT token
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Unauthorized', message: 'Missing token' });
            }
            const decoded = await request.jwtVerify();
            // Fetch user with organization
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                    memberships: {
                        where: { organizationId: decoded.orgId },
                        select: {
                            role: true,
                            organization: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!user) {
                return reply.status(401).send({ error: 'Unauthorized', message: 'User not found' });
            }
            const membership = user.memberships[0];
            if (!membership) {
                return reply.status(403).send({ error: 'Forbidden', message: 'Not a member of this organization' });
            }
            request.authUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
            };
            request.authOrganization = {
                id: membership.organization.id,
                name: membership.organization.name,
                slug: membership.organization.slug,
            };
            request.authMembership = {
                role: membership.role,
                organizationId: decoded.orgId,
            };
        }
        catch (err) {
            // Check for Prisma errors by error code
            if (err && typeof err === 'object' && 'code' in err && err.code === 'P2003') {
                console.error('Database error in auth:', err);
            }
            return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid token' });
        }
    });
}
//# sourceMappingURL=auth.js.map