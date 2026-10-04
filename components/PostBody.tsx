import { MDXRemote } from "next-mdx-remote/rsc";

export function PostBody({ content }: { content: string }) {
	return (
		<div className="post-content">
			<MDXRemote source={content} />
		</div>
	);
}
