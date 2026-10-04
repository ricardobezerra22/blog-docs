export default function HomeLoading() {
	return (
		<div className="page-wrap">

			{/* Top bar */}
			<div aria-hidden="true" style={{ display: "flex", justifyContent: "space-between", padding: "36px 0 0" }}>
				<div className="skeleton" style={{ width: 110, height: 10 }} />
				<div className="skeleton" style={{ width: 32, height: 10 }} />
			</div>

			{/* Header */}
			<header style={{ padding: "40px 0 48px" }}>
				<div className="skeleton" style={{ width: "clamp(220px, 60vw, 520px)", height: "clamp(56px, 12vw, 128px)", borderRadius: 4 }} />
				<div style={{ marginTop: 24, display: "flex", gap: 16, alignItems: "center" }}>
					<div className="skeleton" style={{ width: 70, height: 14 }} />
					<div className="skeleton" style={{ width: 1, height: 12 }} />
					<div className="skeleton" style={{ width: 140, height: 14 }} />
				</div>
			</header>

			{/* Divider */}
			<div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />

			{/* Filter bar */}
			<div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
				<div className="skeleton" style={{ flex: "1 1 180px", height: 40 }} />
				<div className="skeleton" style={{ flex: "1 1 140px", height: 40 }} />
				<div className="skeleton" style={{ flex: "1 1 140px", height: 40 }} />
			</div>

			{/* Post rows */}
			<main id="main-content" aria-busy="true" aria-label="Loading releases">
				{Array.from({ length: 5 }, (_, i) => (
					<div
						key={i}
						className="skeleton-row"
						style={{ animationDelay: `${i * 0.08}s` }}
						aria-hidden="true"
					>
						<div className="skeleton skeleton-date" style={{ height: 12 }} />
						<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
							<div className="skeleton" style={{ width: `${72 - i * 6}%`, height: 16 }} />
							<div className="skeleton" style={{ width: `${55 - i * 4}%`, height: 12 }} />
							<div style={{ display: "flex", gap: 6, marginTop: 4 }}>
								<div className="skeleton" style={{ width: 52, height: 18, borderRadius: 2 }} />
								<div className="skeleton" style={{ width: 40, height: 18, borderRadius: 2 }} />
							</div>
						</div>
					</div>
				))}
			</main>
		</div>
	);
}
