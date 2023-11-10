import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getUsersByAddresses } from "@/backend/user/user";
import { fetchOnChainGraphData } from "@/backend/recommendation-engine/airstack/onchain-graph";
import { syncRecommendedUsers } from "@/backend/recommendedUser";

export const SCORE_THRESHOLD = 15;

export const GET = async (req: NextRequest) => {
	if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}
	const users = await getAllUsers();

	for await (const user of users.data) {
		const recommendedUsers = await fetchOnChainGraphData(user.wallet);
		const topRecommendedUsers = recommendedUsers.filter(user => user._score >= SCORE_THRESHOLD);
		const topRecommendedUsersAddresses = topRecommendedUsers.flatMap(u => u.addresses);
		const topRecommendedUsersOnBuilderFI = await getUsersByAddresses(topRecommendedUsersAddresses as string[]);
		const usersWithScore = topRecommendedUsersOnBuilderFI.data.map(user => {
			const score = topRecommendedUsers.find(u => u.addresses?.includes(user.wallet))?._score
			if (!score) {
				console.error("No match between builderfi and score")
				return null;
			}
			return {
				userId: user.id,
				score
			}
		})
		await syncRecommendedUsers(user.id, usersWithScore.filter(Boolean).map(userWithScore => ({
			sourceUserId: user.id,
				recommendedUserId: userWithScore!.userId,
				recommendationScore: userWithScore!.score,
			createdAt: Date.now(),
			updatedAt: Date.now()
		})))
	}
}