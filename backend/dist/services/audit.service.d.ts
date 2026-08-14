type AuditEvent = {
    actorId?: number | null;
    action: string;
    entity: string;
    entityId?: string | number | null;
    metadata?: Record<string, unknown>;
};
/** Writes a compact, non-sensitive record of a material HRIS action. */
export declare const recordAudit: ({ actorId, action, entity, entityId, metadata }: AuditEvent) => Promise<{
    id: number;
    createdAt: Date;
    actorId: number | null;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: string | null;
}>;
export {};
//# sourceMappingURL=audit.service.d.ts.map