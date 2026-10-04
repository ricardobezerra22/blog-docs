import { PostCard } from "@/components/PostCard";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function HomePage() {
	const posts = await prisma.post.findMany({
		where: { published: true },
		orderBy: { publishedAt: "desc" },
		select: {
			id: true,
			title: true,
			slug: true,
			excerpt: true,
			publishedAt: true,
			tags: { select: { name: true, slug: true } },
		},
	});

	return (
		<main>
			<h1 className="mb-2 text-3xl font-bold">Release Notes</h1>
			<p className="mb-10 text-zinc-500">Documentation updates for Agentic Workflow.</p>
			{posts.length === 0 ? (
				<p className="text-zinc-400">No releases yet.</p>
			) : (
				<ul className="space-y-6">
					{posts.map((post) => (
						<li key={post.id}>
							<PostCard post={post} />
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
