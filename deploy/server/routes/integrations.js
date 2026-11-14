/**
 * Integrations routes
 */
import { z } from 'zod';
import { prisma } from '@domeforms/database';
const createIntegrationSchema = z.object({
    formId: z.string().uuid(),
    type: z.enum(['EMAIL', 'WEBHOOK', 'ZAPIER', 'MAILCHIMP', 'HUBSPOT', 'SALESFORCE', 'ACTIVECAMPAIGN', 'CONVERTKIT', 'STRIPE', 'PAYPAL', 'TWILIO', 'CUSTOM']),
    name: z.string(),
    config: z.record(z.unknown()),
    mapping: z.array(z.object({ formFieldId: z.string(), integrationField: z.string(), transform: z.string().optional() })),
    enabled: z.boolean().default(true),
    runOn: z.string().default('submit'),
});
function toPrismaJson(value) {
    return value;
}
export async function integrationsRoutes(fastify) {
    fastify.get('/', async (request, reply) => {
        const { formId } = request.query;
        return prisma.integration.findMany({ where: formId ? { formId } : {}, include: { logs: { take: 5, orderBy: { createdAt: 'desc' } } } });
    });
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
        return prisma.integration.findUnique({ where: { id }, include: { logs: { orderBy: { createdAt: 'desc' } } } });
    });
    fastify.post('/', async (request, reply) => {
        const data = createIntegrationSchema.parse(request.body);
        return prisma.integration.create({
            data: {
                ...data,
                config: toPrismaJson(data.config),
                mapping: data.mapping,
            }
        });
    });
    fastify.patch('/:id', async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        return prisma.integration.update({
            where: { id },
            data: {
                ...body,
                config: body.config ? toPrismaJson(body.config) : undefined,
                mapping: body.mapping,
                updatedAt: new Date()
            }
        });
    });
    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params;
        await prisma.integration.delete({ where: { id } });
        return { success: true };
    });
    fastify.post('/:id/test', async (request, reply) => {
        // Test integration endpoint
        return { success: true, message: 'Integration test triggered' };
    });
}
//# sourceMappingURL=integrations.js.map