import prisma from '../config/db.js';
/** Writes a compact, non-sensitive record of a material HRIS action. */
export const recordAudit = async ({ actorId, action, entity, entityId, metadata }) => {
    return prisma.auditLog.create({
        data: {
            actorId: actorId ?? null,
            action,
            entity,
            entityId: entityId == null ? null : String(entityId),
            metadata: metadata ? JSON.stringify(metadata) : null,
        },
    });
};
//# sourceMappingURL=audit.service.js.map