import { env } from "@/lib/env";

export function requireApiKey(req: Request): Response | null {
	const key = req.headers.get("x-api-key");
	if (!key || key !== env.BLOG_API_KEY) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	return null;
}
