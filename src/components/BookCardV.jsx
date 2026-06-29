export default function BookCardV({ book, onClick }) {
  const coverId = book.cover_id || book.coverId
  const cover = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : null

  const totalPages = Number(book.pages) || 0
  const currentPage = Number(book.current_page ?? book.currentpage) || 0
  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : currentPage

  const progressPercent =
    totalPages > 0 ? Math.round((safeCurrentPage / totalPages) * 100) : 0

  return (
    <div
      onClick={onClick}
      style={{
        width: "172px",
        flexShrink: 0,
        cursor: "pointer",
        transform: "translateY(0)",
        transition:
          "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease-out",
      }}
    >
      <div
        style={{
          width: "172px",
          height: "248px",
          borderRadius: "14px",
          overflow: "hidden",
          background: "var(--color-surface-high)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
          marginBottom: "14px",
          transition:
            "transform 340ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 340ms cubic-bezier(0.22, 1, 0.36, 1), filter 300ms ease-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)"
          e.currentTarget.style.boxShadow = "0 18px 34px rgba(0,0,0,0.18)"
          e.currentTarget.style.filter = "saturate(1.02)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.15)"
          e.currentTarget.style.filter = "saturate(1)"
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "46px",
            }}
          >
            📖
          </div>
        )}
      </div>

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "18px",
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: 6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          color: "var(--color-text)",
        }}
      >
        {book.title}
      </p>

      <p
        style={{
          fontSize: "12px",
          color: "var(--color-text-muted)",
          marginBottom: 10,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {book.author}
      </p>

      <div style={{ marginTop: 6 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Progresso
          </span>

          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-primary)",
            }}
          >
            {progressPercent}%
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "8px",
            borderRadius: "999px",
            background: "var(--color-surface-high)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              borderRadius: "999px",
              background:
                "linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))",
              transition: "width 280ms ease-out",
            }}
          />
        </div>
      </div>
    </div>
  )
}