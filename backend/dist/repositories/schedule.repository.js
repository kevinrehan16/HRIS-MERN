import prisma from '../config/db.js'; // Gamitin ang shared instance
export const scheduleRepository = {
    // Maghanap ng schedule gamit ang unique na pangalan
    findByName: async (name) => {
        return await prisma.schedule.findUnique({
            where: { name }
        });
    },
    // Mag-save ng bagong schedule sa database
    create: async (data) => {
        return await prisma.schedule.create({
            data
        });
    }
};
//# sourceMappingURL=schedule.repository.js.map