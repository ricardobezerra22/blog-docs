import { FilterBar } from "@/components/FilterBar";
import { PostCard } from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const revalidate = 60;

type Props = { searchParams: Promise<{ q?: string; tag?: string; date?: string }> };

export default async function HomePage({ searchParams }: Props) {
	const { q = "", tag = "", date = "" } = await searchParams;

	const where: Prisma.PostWhereInput = { published: true };
	if (q)    where.title = { contains: q, mode: "insensitive" };
	if (tag)  where.tags  = { some: { slug: tag } };
	if (date) {
		const [year, month] = date.split("-").map(Number);
		where.publishedAt = { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) };
	}

	const [posts, tagRows, dateMeta] = await Promise.all([
		prisma.post.findMany({
			where,
			orderBy: { publishedAt: "desc" },
			select: {
				id: true,
				title: true,
				slug: true,
				excerpt: true,
				publishedAt: true,
				tags: { select: { name: true, slug: true } },
			},
		}),
		prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
		prisma.post.findMany({
			where: { published: true, publishedAt: { not: null } },
			select: { publishedAt: true },
			orderBy: { publishedAt: "desc" },
		}),
	]);

	const allDates = [
		...new Map(
			dateMeta.map(({ publishedAt }) => {
				const d = publishedAt!;
				const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
				const label = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
				return [value, { value, label }];
			})
		).values(),
	];

	const totalAll = q || tag || date ? await prisma.post.count({ where: { published: true } }) : posts.length;

	return (
		<div className="page-wrap">

			{/* Top bar — decorative, aria-hidden so screen readers skip the noise */}
			<div
				aria-hidden="true"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "36px 0 0",
				}}
			>
				<span style={{
					fontFamily: "var(--font-mono)",
					fontSize: "10px",
					letterSpacing: "0.18em",
					textTransform: "uppercase",
					color: "var(--fg-subtle)",
				}}>
					Agentic Workflow
				</span>
				<span style={{
					fontFamily: "var(--font-mono)",
					fontSize: "10px",
					color: "var(--fg-subtle)",
					letterSpacing: "0.1em",
				}}>
					{new Date().getFullYear()}
				</span>
			</div>

			{/* Page header */}
			<header style={{ padding: "40px 0 48px" }}>
				<h1
					aria-label="Changelog"
					style={{
						fontFamily: "var(--font-syne)",
						fontSize: "clamp(3.5rem, 12vw, 8rem)",
						fontWeight: 800,
						lineHeight: 0.88,
						letterSpacing: "-0.03em",
						color: "var(--fg)",
					}}
				>
					CHANGE
					<br />
					LOG<span className="cursor-blink" aria-hidden="true" style={{ color: "var(--accent)" }}>_</span>
				</h1>

				<p
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
						color: "var(--fg-muted)",
						marginTop: "24px",
						display: "flex",
						alignItems: "center",
						gap: "16px",
						flexWrap: "wrap",
					}}
				>
					<span>{totalAll} release{totalAll !== 1 ? "s" : ""}</span>
					<span aria-hidden="true" style={{ width: "1px", height: "12px", background: "var(--border)", display: "inline-block" }} />
					<span style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: "7px" }}>
						<span
							aria-hidden="true"
							style={{
								width: "6px",
								height: "6px",
								borderRadius: "50%",
								background: "var(--accent)",
								boxShadow: "0 0 6px rgba(184,255,87,0.5)",
								display: "inline-block",
								flexShrink: 0,
							}}
						/>
						all systems operational
					</span>
				</p>
			</header>

			{/* Divider */}
			<div
				role="separator"
				aria-hidden="true"
				style={{
					height: "1px",
					background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)",
					marginBottom: "24px",
				}}
			/>

			{/* Filters */}
			<FilterBar q={q} tag={tag} date={date} allTags={tagRows} allDates={allDates} />

			{/* Posts list */}
			<main id="main-content">
				{/* Live region announces filtered count to screen readers */}
				<p
					aria-live="polite"
					aria-atomic="true"
					className="sr-only"
				>
					{posts.length} release{posts.length !== 1 ? "s" : ""} shown
				</p>

				{posts.length === 0 ? (
					<p style={{
						fontFamily: "var(--font-mono)",
						fontSize: "0.8125rem",
						color: "var(--fg-muted)",
						padding: "40px 0",
					}}>
						No releases match your filters.
					</p>
				) : (
					<ul
						role="list"
						aria-label="Release posts"
						style={{ listStyle: "none", padding: 0, margin: 0 }}
					>
						{posts.map((post, i) => (
							<li
								key={post.id}
								className="post-card"
								style={{ animationDelay: `${i * 0.06 + 0.04}s` }}
							>
								<PostCard post={post} />
							</li>
						))}
					</ul>
				)}
			</main>

			{/* Footer */}
			<footer style={{
				marginTop: "72px",
				paddingTop: "28px",
				paddingBottom: "48px",
				borderTop: "1px solid rgba(255,255,255,0.04)",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				flexWrap: "wrap",
				gap: "8px",
			}}>
				<span style={{
					fontFamily: "var(--font-mono)",
					fontSize: "10px",
					color: "var(--fg-subtle)",
					letterSpacing: "0.1em",
					textTransform: "uppercase",
				}}>
					agentic-workflow
				</span>
				<span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-subtle)" }}>
					blog-docs
				</span>
			</footer>
		</div>
	);
}
