import Link from "next/link";

type Post = {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	publishedAt: Date | null;
	tags: { name: string; slug: string }[];
};

export function PostCard({ post }: { post: Post }) {
	return (
		<article className="rounded-lg border border-zinc-200 p-5 transition-shadow hover:shadow-sm">
			<Link href={`/${post.slug}`} className="group">
				<h2 className="text-xl font-semibold group-hover:text-blue-600">{post.title}</h2>
			</Link>
			{post.excerpt && <p className="mt-1 text-sm text-zinc-500">{post.excerpt}</p>}
			<div className="mt-3 flex items-center gap-4">
				{post.publishedAt && (
					<time className="text-xs text-zinc-400" dateTime={post.publishedAt.toISOString()}>
						{post.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
					</time>
				)}
				{post.tags.map((tag) => (
					<span key={tag.slug} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
						{tag.name}
					</span>
				))}
			</div>
		</article>
	);
}
