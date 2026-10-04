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
	const dateDisplay = post.publishedAt
		? post.publishedAt
				.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
				.replace(/\//g, ".")
		: null;

	const dateReadable = post.publishedAt?.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<Link
			href={`/${post.slug}`}
			className="entry-grid"
			/* Descriptive label for screen readers: title + date if available */
			aria-label={`${post.title}${dateReadable ? `, published ${dateReadable}` : ""}`}
		>
			{/* Date column */}
			<div>
				{dateDisplay && (
					<time
						className="entry-date"
						dateTime={post.publishedAt!.toISOString()}
						/* Hide from SR — the aria-label on the link already includes the readable date */
						aria-hidden="true"
					>
						{dateDisplay}
					</time>
				)}
			</div>

			{/* Content column */}
			<div>
				{/* aria-hidden: the full post title is already in the link's aria-label */}
				<p className="entry-title" aria-hidden="true">
					{post.title}
				</p>

				{post.excerpt && (
					<p className="entry-excerpt">
						{post.excerpt}
					</p>
				)}

				{post.tags.length > 0 && (
					<ul
						role="list"
						aria-label="Tags"
						style={{ display: "flex", gap: "5px", marginTop: "10px", flexWrap: "wrap", listStyle: "none", padding: 0 }}
					>
						{post.tags.map((tag) => (
							<li key={tag.slug}>
								<span className="entry-tag">{tag.name}</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</Link>
	);
}
