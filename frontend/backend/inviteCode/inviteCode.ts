import prisma from "@/lib/prisma";
import { generateRandomString } from "@/lib/utils";

export const createAdminInviteCodes = async (count: number, activateOnCreation?: boolean) => {
  const res = prisma.$transaction(async tx => {
    const tryGenerateUniqueCode = async (): Promise<string> => {
      const code = "bf-" + generateRandomString(8);
      const existing = await tx.inviteCode.findUnique({ where: { code } });
      if (existing) {
        return await tryGenerateUniqueCode();
      }
      return code;
    };

    return await Promise.all(
      new Array(count).fill("").map(async () => {
        const code = await tryGenerateUniqueCode();

        return await tx.inviteCode.create({
          data: {
            code: code,
            userId: 1,
            used: 0,
            maxUses: 1,
            isActive: activateOnCreation || false
          }
        });
      })
    );
  });

  return { data: res };
};
