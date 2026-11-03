export function RecordIcon({ name, size = 16 }: { name: string; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" as const };
  switch (name) {
    case "bitcoin":
      return (
        <svg {...props} fill="currentColor">
          <path d="M14.5 11.3c2.7.5 3.4-3.3.7-3.8m-.7 3.8-3.3-.6m3.3.6.7 3.8c2.7.5 3.4-3.3.7-3.8M11.2 7.5l.6 3.4M10.5 4.1l.6 3.4M8.8 16.3l3.3.6M9.4 19.7l.6-3.4" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
      );
    case "zap":
      return (
        <svg {...props} fill="currentColor">
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="2">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "key":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="2">
          <circle cx="8" cy="15" r="4" />
          <path d="M11.5 12.5 20 4M16 4h4v4" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...props} fill="currentColor">
          <path d="M9.78 18.65 10.06 14.42 17.74 7.5c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
        </svg>
      );
    case "github":
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 .3C5.37.3 0 5.67 0 12.3c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.69.82.57C20.56 22.1 24 17.6 24 12.3 24 5.67 18.63.3 12 .3z" />
        </svg>
      );
    case "x":
      return (
        <svg {...props} fill="currentColor">
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.59l-5.16-6.74L5.9 22H2.88l7.24-8.27L.8 2h6.76l4.66 6.18L18.9 2Zm-1.16 18h1.83L6.37 3.89H4.41L17.74 20Z" />
        </svg>
      );
    case "nostr":
      return (
        <svg {...props}>
          <text x="12" y="17" fill="currentColor" fontSize="16" fontWeight="800" textAnchor="middle">
            n
          </text>
        </svg>
      );
    default:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="2">
          <path d="M6 22V4a2 2 0 0 1 2-2h8l6 6v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
          <path d="M14 2v6h6" />
        </svg>
      );
  }
}
