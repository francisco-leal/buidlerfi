import { getReactions } from "@/backend/question/question";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const questionId = req.nextUrl.searchParams.get("questionId");
  const type = req.nextUrl.searchParams.get("type");
  if (!questionId || !type || (type !== "like" && type !== "upvote"))
    return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
  return NextResponse.json(await getReactions(Number(questionId), type));
}
