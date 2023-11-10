import prisma from "@/lib/prisma";
import { RecommendedUser } from "@/models/recommendedUser.model";

export const syncRecommendedUsers = async (userId: number, recommendedUsers: RecommendedUser[]) => {
	await prisma.$transaction(async tx => {
		// first clean the old recommended users
		await tx.recommendedUser.delete({
			where: { sourceUserId: userId },
		});

		// then create them again to update the list
		await tx.recommendedUser.createMany({data: recommendedUsers});
	});
}