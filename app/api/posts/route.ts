import { requireApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

	const body = await req.json();
	const { title, slug, content, excerpt, published, tags } = body;

	if (!title || !slug || !content) {
		return Response.json({ error: "title, slug, and content are required" }, { status: 400 });
	}

	const post = await prisma.post.create({
		data: {
			title,
			slug,
			content,
			excerpt: excerpt ?? null,
			published: published ?? false,
			publishedAt: published ? new Date() : null,
			tags: tags?.length
				? {
						connectOrCreate: tags.map((t: { name: string; slug: string }) => ({
							where: { slug: t.slug },
							create: { name: t.name, slug: t.slug },
						})),
					}
				: undefined,
		},
	});

	return Response.json(post, { status: 201 });
}
