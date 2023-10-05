import UpsertUser from "@/backend/services/users/upsert";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.wallet) {
      return Response.json({ error: "Wallet field is mandatory" }, { status: 409 });
    }
    const user = await UpsertUser.call(body.wallet);

    return Response.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}
