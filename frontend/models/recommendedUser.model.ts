export interface RecommendedUser {
	id?: string;
	sourceUserId: number;
	recommendedUserId: number;
	recommendationScore: number;
	createdAt: number;
	updatedAt: number;
}