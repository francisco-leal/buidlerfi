import {RecommendedUser} from "./interfaces/recommended-user";

const sortByScore = (recommendations: (RecommendedUser & {
    _score: number
})[]) => recommendations.sort((a, b) => (b._score || 0) - (a._score || 0))

export default sortByScore;