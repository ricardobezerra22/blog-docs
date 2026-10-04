import { requireApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
	const { id } = await params;

	const post = await prisma.post.findUnique({
		where: { id },
		include: { tags: { select: { name: true, slug: true } } },
	});

	if (!post) return Response.json({ error: "Not found" }, { status: 404 });
	return Response.json(post);
}

export async function PUT(req: Request, { params }: Params) {
	const deny = requireApiKey(req);
	if (deny) return deny;

	const { id } = await params;
	const body = await req.json();
	const { title, slug, content, excerpt, published, tags } = body;

	const post = await prisma.post.update({
		where: { id },
		data: {
			...(title && { title }),
			...(slug && { slug }),
			...(content && { content }),
			excerpt: excerpt ?? undefined,
			...(published !== undefined && {
				published,
				publishedAt: published ? new Date() : null,
			}),
			...(tags && {
				tags: {
					set: [],
					connectOrCreate: tags.map((t: { name: string; slug: string }) => ({
						where: { slug: t.slug },
						create: { name: t.name, slug: t.slug },
					})),
				},
			}),
		},
	});

	return Response.json(post);
}

export async function DELETE(req: Request, { params }: Params) {
	const deny = requireApiKey(req);
	if (deny) return deny;

	const { id } = await params;
	await prisma.post.delete({ where: { id } });
	return new Response(null, { status: 204 });
}
