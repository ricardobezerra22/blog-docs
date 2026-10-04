import { PostBody } from "@/components/PostBody";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = await prisma.post.findUnique({
		where: { slug },
		select: { title: true, excerpt: true },
	});
	if (!post) return {};
	return {
		title: `${post.title} — Agentic Workflow`,
		description: post.excerpt ?? undefined,
	};
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

	const dateReadable = post.publishedAt?.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const dateShort = post.publishedAt
		?.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
		.replace(/\//g, ".");

	return (
		<div className="page-wrap">

			{/* Back navigation */}
			<nav aria-label="Breadcrumb" style={{ padding: "36px 0 48px" }}>
				<Link href="/" className="back-link">
					<span aria-hidden="true">←</span>
					<span>Changelog</span>
				</Link>
			</nav>

			{/* Article */}
			<article aria-labelledby="post-title">

				{/* Header */}
				<header style={{ marginBottom: "52px" }}>
					{dateShort && (
						<p
							aria-hidden="true"
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: "10px",
								color: "var(--fg-muted)",
								letterSpacing: "0.08em",
								marginBottom: "16px",
							}}
						>
							{dateShort}
						</p>
					)}

					<h1
						id="post-title"
						style={{
							fontFamily: "var(--font-syne)",
							fontSize: "clamp(2rem, 7vw, 4rem)",
							fontWeight: 800,
							lineHeight: 1.0,
							letterSpacing: "-0.025em",
							color: "var(--fg)",
							marginBottom: "28px",
						}}
					>
						{post.title}
					</h1>

					{/* Tags + visible date */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							flexWrap: "wrap",
						}}
					>
						{post.tags.length > 0 && (
							<ul
								role="list"
								aria-label="Post tags"
								style={{ display: "flex", gap: "6px", flexWrap: "wrap", listStyle: "none", padding: 0, margin: 0 }}
							>
								{post.tags.map((tag) => (
									<li key={tag.slug}>
										<span
											style={{
												fontFamily: "var(--font-mono)",
												fontSize: "9px",
												letterSpacing: "0.1em",
												textTransform: "uppercase",
												color: "var(--accent)",
												border: "1px solid rgba(184,255,87,0.3)",
												padding: "3px 9px",
												borderRadius: "2px",
												display: "inline-block",
											}}
										>
											{tag.name}
										</span>
									</li>
								))}
							</ul>
						)}

						{dateReadable && (
							<>
								{post.tags.length > 0 && (
									<span aria-hidden="true" style={{ width: "1px", height: "12px", background: "var(--border)", display: "inline-block" }} />
								)}
								<time
									dateTime={post.publishedAt!.toISOString()}
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.6875rem",
										color: "var(--fg-muted)",
									}}
								>
									{dateReadable}
								</time>
							</>
						)}
					</div>

					{/* Accent divider */}
					<div
						role="separator"
						aria-hidden="true"
						style={{
							height: "1px",
							marginTop: "36px",
							background: "linear-gradient(to right, rgba(184,255,87,0.4), rgba(184,255,87,0.06) 40%, transparent)",
						}}
					/>
				</header>

				{/* Post content */}
				<PostBody content={post.content} />

			</article>

			{/* Footer */}
			<footer style={{
				marginTop: "80px",
				paddingTop: "32px",
				paddingBottom: "56px",
				borderTop: "1px solid rgba(255,255,255,0.05)",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				flexWrap: "wrap",
				gap: "8px",
			}}>
				<Link href="/" className="back-link-foot">
					<span aria-hidden="true">←</span> All releases
				</Link>
				<span style={{
					fontFamily: "var(--font-mono)",
					fontSize: "10px",
					color: "var(--fg-subtle)",
					letterSpacing: "0.08em",
				}}>
					agentic-workflow
				</span>
			</footer>
		</div>
	);
}
