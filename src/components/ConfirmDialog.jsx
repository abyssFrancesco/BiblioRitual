export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes confirmFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes confirmPopIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        className="modal-overlay"
        onClick={onCancel}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          backdropFilter: 'blur(6px)',
          background: 'rgba(16, 24, 20, 0.34)',
          animation: 'confirmFadeIn 180ms ease-out',
          zIndex: 2000,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--color-surface)',
            borderRadius: 24,
            border: '1px solid var(--color-outline-variant)',
            boxShadow: '0 22px 60px rgba(0,0,0,0.18)',
            padding: 22,
            animation: 'confirmPopIn 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: danger ? '#b85c5c' : 'var(--color-primary)',
                marginBottom: 8,
              }}
            >
              {danger ? 'Azione delicata' : 'Conferma'}
            </p>

            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontSize: 24,
                lineHeight: 1.2,
                color: 'var(--color-text)',
                marginBottom: 10,
              }}
            >
              {title}
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              {message}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                border: '1.5px solid var(--color-outline-variant)',
                background: 'transparent',
                color: 'var(--color-text)',
                borderRadius: 12,
                padding: '11px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 110,
              }}
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              style={{
                border: 'none',
                background: danger
                  ? 'linear-gradient(135deg, #c65b5b 0%, #b64141 100%)'
                  : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                color: '#fff',
                borderRadius: 12,
                padding: '11px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 140,
                boxShadow: danger
                  ? '0 10px 24px rgba(182, 65, 65, 0.22)'
                  : '0 10px 24px rgba(45, 90, 61, 0.18)',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}