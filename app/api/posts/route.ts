import { requireApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	const { searchParams } = req.nextUrl;
	const page = Math.max(1, Number(searchParams.get("page") ?? 1));
	const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));

	const [posts, total] = await Promise.all([
		prisma.post.findMany({
			where: { published: true },
			orderBy: { publishedAt: "desc" },
			skip: (page - 1) * limit,
			take: limit,
			select: {
				id: true,
				title: true,
				slug: true,
				excerpt: true,
				publishedAt: true,
				tags: { select: { name: true, slug: true } },
			},
		}),
		prisma.post.count({ where: { published: true } }),
	]);

	return Response.json({ posts, total, page, limit });
}

export async function POST(req: Request) {
	const deny = requireApiKey(req);
	if (deny) return deny;

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "request body must be valid JSON" }, { status: 400 });
	}

	const { title, slug, content, excerpt, published, tags } = body as Record<string, unknown>;

	if (!title || !slug || !content) {
		return Response.json({ error: "title, slug, and content are required" }, { status: 400 });
	}

	try {
		const post = await prisma.post.create({
			data: {
				title: title as string,
				slug: slug as string,
				content: content as string,
				excerpt: (excerpt as string) ?? null,
				published: (published as boolean) ?? false,
				publishedAt: published ? new Date() : null,
				tags: (tags as { name: string; slug: string }[])?.length
					? {
							connectOrCreate: (tags as { name: string; slug: string }[]).map((t) => ({
								where: { slug: t.slug },
								create: { name: t.name, slug: t.slug },
							})),
						}
					: undefined,
			},
		});

		return Response.json(post, { status: 201 });
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
			return Response.json({ error: `a post with slug "${slug}" already exists` }, { status: 409 });
		}
		console.error("POST /api/posts failed:", err);
		return Response.json({ error: "failed to create post" }, { status: 500 });
	}
}
