import prisma from '../config/db.js';

type AuditEvent = {
  actorId?: number | null;
  action: string;
  entity: string;
  entityId?: string | number | null;
  metadata?: Record<string, unknown>;
};

/** Writes a compact, non-sensitive record of a material HRIS action. */
export const recordAudit = async ({ actorId, action, entity, entityId, metadata }: AuditEvent) => {
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