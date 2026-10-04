import { PostBody } from "@/components/PostBody";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = await prisma.post.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
	if (!post) return {};
	return { title: post.title, description: post.excerpt ?? undefined };
}

export async function generateStaticParams() {
	const posts = await prisma.post.findMany({ where: { published: true }, select: { slug: true } });
	return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: Props) {
	const { slug } = await params;

	const post = await prisma.post.findUnique({
		where: { slug },
		include: { tags: { select: { name: true, slug: true } } },
	});

	if (!post || !post.published) notFound();

	return (
		<article>
			<header className="mb-8">
				<h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
				{post.publishedAt && (
					<time className="text-sm text-zinc-400" dateTime={post.publishedAt.toISOString()}>
						{post.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
					</time>
				)}
				{post.tags.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<span key={tag.slug} className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
								{tag.name}
							</span>
						))}
					</div>
				)}
			</header>
			<PostBody content={post.content} />
		</article>
	);
}
