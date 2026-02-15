import { Loader2, Plus } from "lucide-react";
import ReactNode from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;

  buttonLabel?: string;
  onButtonClick?: () => void;
  isLoading?: boolean;
  icon?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  isLoading = false,
  icon,
}: PageHeaderProps) {
  return (
    <div
      className="mb-8 rounded-lg"
      style={{
        background: "#0a0a0a",                         // same dark bg
        border: "1px solid rgba(210,179,130,0.15)",    // EXACT HeaderStats border
        padding: "1.5rem",                              // same as stat-card padding
      }}
    >
      {/* EXACT same flex layout */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* TITLE BLOCK */}
        <div>
          <h1
            className="font-heading font-bold text-judge-ivory"
            style={{
              fontSize: "2rem",        // exact stat-card value style
              lineHeight: "1.1",
              marginBottom: "0.5rem",
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                fontSize: "0.875rem",  // EXACT subtitle size from HeaderStats
                color: "rgba(210,179,130,0.7)",
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* ADD BUTTON */}
        {buttonLabel && onButtonClick && (
          <button
            onClick={onButtonClick}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2"
            style={{
              padding: "0.5rem 1.5rem",
              background: "#D2B382",            // constitution-gold exact
              color: "#0a0a0a",
              borderRadius: "8px",
              fontWeight: 700,
              border: "none",
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              icon ?? <Plus className="w-5 h-5" />
            )}
            <span>{isLoading ? "Creating..." : buttonLabel}</span>
          </button>
        )}
      </div>

      {/* EXACT separator line */}
      <div
        style={{
          marginTop: "1.5rem",
          borderBottom: "1px solid rgba(210,179,130,0.2)",
        }}
      />
    </div>
  );
}
