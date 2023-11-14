import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: number } }) {
  try {
    const body = await req.json();
    const question = await prisma.question.findUnique({ where: { id: Number(params.id) } });
    if (!question) return Response.json({ error: ERRORS.QUESTION_NOT_FOUND }, { status: 404 });

    const replier = await prisma.user.findUnique({ where: { privyUserId: req.headers.get("privyUserId")! } });

    if (question.replierId !== replier?.id) return Response.json({ error: ERRORS.UNAUTHORIZED }, { status: 401 });

    const res = await prisma.question.update({
      where: { id: Number(params.id) },
      data: {
        reply: body["answerContent"],
        repliedOn: new Date()
      }
    });

    return Response.json({ data: res }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
