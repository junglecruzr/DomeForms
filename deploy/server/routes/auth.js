/**
 * Auth routes
 */
import { z } from 'zod';
import { prisma } from '@domeforms/database';
import bcrypt from 'bcryptjs';
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
    organizationName: z.string().optional(),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
export async function authRoutes(fastify) {
    fastify.post('/register', async (request, reply) => {
        const data = registerSchema.parse(request.body);
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return reply.status(409).send({ error: 'Conflict', message: 'Email already registered' });
        }
        const passwordHash = await bcrypt.hash(data.password, 12);
        // Create user and organization in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email: data.email, passwordHash, name: data.name },
            });
            let organization;
            if (data.organizationName) {
                organization = await tx.organization.create({
                    data: { name: data.organizationName, slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'), ownerId: user.id },
                });
            }
            else {
                // Create default organization for the user
                organization = await tx.organization.create({
                    data: { name: `${user.name || user.email}\'s Organization`, slug: `${user.email.split('@')[0]}-org-${user.id.slice(0, 8)}`, ownerId: user.id },
                });
            }
            await tx.membership.create({
                data: { userId: user.id, organizationId: organization.id, role: 'OWNER' },
            });
            await tx.workspace.create({
                data: { organizationId: organization.id, name: 'Default Workspace' },
            });
            return { user, organization };
        });
        const token = fastify.jwt.sign({ userId: result.user.id, orgId: result.organization?.id });
        // Set HttpOnly cookie
        reply.setCookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });
        return { user: { id: result.user.id, email: result.user.email, name: result.user.name }, token };
    });
    fastify.post('/login', async (request, reply) => {
        const data = loginSchema.parse(request.body);
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user || !user.passwordHash) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid credentials' });
        }
        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid credentials' });
        }
        // Get first organization
        const membership = await prisma.membership.findFirst({
            where: { userId: user.id },
            include: { organization: true }
        });
        if (!membership) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'No organization found' });
        }
        const token = fastify.jwt.sign({ userId: user.id, orgId: membership.organizationId });
        // Set HttpOnly cookie
        reply.setCookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/"
        });
        return { user: { id: user.id, email: user.email, name: user.name }, token, organization: membership.organization };
    });
    fastify.get('/me', async (request, reply) => {
        const decoded = await request.jwtVerify();
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, avatarUrl: true }
        });
        if (!user) {
            return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
        }
        return { user };
    });
    fastify.post('/refresh', async (request, reply) => {
        const decoded = await request.jwtVerify();
        // Get user's first organization
        const membership = await prisma.membership.findFirst({ where: { userId: decoded.userId } });
        const orgId = membership?.organizationId;
        const token = fastify.jwt.sign({ userId: decoded.userId, orgId });
        return { token };
    });
}
//# sourceMappingURL=auth.js.map