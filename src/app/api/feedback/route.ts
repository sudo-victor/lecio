import { interactions } from "@/db/schema";
import { db } from "@/lib/db";

interface FeedbackPayload {
  topic?: string;
  output?: string;
  useful?: boolean;
}

const memoryFallback: Array<{
  topic: string;
  output: string;
  useful: boolean;
  createdAt: string;
}> = [];

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = (await request.json()) as FeedbackPayload;
    const topic = payload.topic?.trim() ?? "";
    const output = payload.output?.trim() ?? "";

    if (!topic || !output || typeof payload.useful !== "boolean") {
      return Response.json(
        { error: "Payload invalido. Informe topic, output e useful." },
        { status: 400 },
      );
    }

    if (db) {
      await db.insert(interactions).values({
        topic,
        output,
        useful: payload.useful,
      });

      return Response.json({ ok: true, persisted: "database" }, { status: 201 });
    }

    memoryFallback.push({
      topic,
      output,
      useful: payload.useful,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ ok: true, persisted: "memory" }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Nao foi possivel registrar feedback." },
      { status: 500 },
    );
  }
}
