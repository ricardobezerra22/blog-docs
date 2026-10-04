export default function PostLoading() {
	return (
		<div className="page-wrap">

			{/* Back nav */}
			<nav style={{ padding: "36px 0 48px" }}>
				<div className="skeleton" style={{ width: 90, height: 14 }} />
			</nav>

			{/* Article header */}
			<article aria-busy="true" aria-label="Loading post">
				<header style={{ marginBottom: 52 }}>
					{/* Date */}
					<div className="skeleton" style={{ width: 72, height: 10, marginBottom: 16 }} />

					{/* Title — two lines like the real heading */}
					<div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
						<div className="skeleton" style={{ width: "min(480px, 80%)", height: "clamp(32px, 7vw, 64px)", borderRadius: 4 }} />
						<div className="skeleton" style={{ width: "min(320px, 55%)", height: "clamp(32px, 7vw, 64px)", borderRadius: 4 }} />
					</div>

					{/* Tags + readable date */}
					<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
						<div className="skeleton" style={{ width: 60, height: 20, borderRadius: 2 }} />
						<div className="skeleton" style={{ width: 48, height: 20, borderRadius: 2 }} />
						<div className="skeleton" style={{ width: 1, height: 12 }} />
						<div className="skeleton" style={{ width: 100, height: 14 }} />
					</div>

					{/* Accent divider */}
					<div style={{ height: 1, marginTop: 36, background: "rgba(184,255,87,0.12)" }} />
				</header>

				{/* Content lines */}
				<div style={{ display: "flex", flexDirection: "column", gap: 14 }} aria-hidden="true">
					{[90, 100, 75, 100, 85, 60, 100, 92, 70].map((w, i) => (
						<div
							key={i}
							className="skeleton"
							style={{ width: `${w}%`, height: 16, animationDelay: `${i * 0.05}s` }}
						/>
					))}

					{/* Paragraph break */}
					<div style={{ height: 8 }} />
					{[100, 88, 95, 72, 100, 80].map((w, i) => (
						<div
							key={`b${i}`}
							className="skeleton"
							style={{ width: `${w}%`, height: 16, animationDelay: `${(i + 9) * 0.05}s` }}
						/>
					))}
				</div>
			</article>
		</div>
	);
}
