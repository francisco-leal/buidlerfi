import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/backend/user/user";
import { fetchOnChainGraphData } from "@/backend/recommendation-engine/airstack/onchain-graph";

export const GET = async (req: NextRequest) => {
	if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({message: "Unauthorized"}, {status: 401})
	}
	const users = await getAllUsers()

	for await (const user of users.data) {
		const recommendedUsers = await fetchOnChainGraphData(user.wallet);
		// TODO: get top 25, store in db only those that are already builder.fi users
	}
}