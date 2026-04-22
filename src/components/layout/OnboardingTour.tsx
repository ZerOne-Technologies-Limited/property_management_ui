import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "../../lib/store";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TourStep {
  selector?: string;
  title: string;
  message: string;
}

const STEPS: TourStep[] = [
  {
    title: "Welcome!",
    message:
      "This quick tour will walk you through the key parts of the app. It only takes a minute.",
  },
  {
    selector: '[data-tour="property-selector"]',
    title: "Property Selector",
    message:
      "Select your active property here, or visit Properties to create a new one.",
  },
  {
    selector: '[data-tour="nav-home"]',
    title: "Home",
    message:
      "The Home tab shows all your rooms (or units) and their tenants at a glance.",
  },
  {
    selector: '[data-tour="add-room-btn"]',
    title: "Add a Room",
    message:
      "Click here to add a new room (or unit) to the selected property.",
  },
  {
    selector: '[data-tour="nav-tenants"]',
    title: "Tenants",
    message:
      "The Tenants page lists every tenant across the property — assigned and unassigned.",
  },
  {
    selector: '[data-tour="nav-transactions"]',
    title: "Transactions",
    message:
      "The Transactions page lets you record payments, filter by date, and print receipts.",
  },
  {
    title: "You're all set!",
    message:
      "Explore the app at your own pace. You can restart this tour from your profile page anytime.",
  },
];

const PADDING = 10; // px padding around spotlight target

function getRect(el: Element): DOMRect {
  const r = el.getBoundingClientRect();
  return new DOMRect(
    r.left - PADDING,
    r.top - PADDING,
    r.width + PADDING * 2,
    r.height + PADDING * 2
  );
}

export function OnboardingTour() {
  const hasSeenTour = useAppStore((s) => s.hasSeenTour);
  const setHasSeenTour = useAppStore((s) => s.setHasSeenTour);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const currentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const isCentred = !currentStep.selector;

  const finish = useCallback(() => {
    setHasSeenTour(true);
  }, [setHasSeenTour]);

  // Measure target element and keep it fresh
  const measure = useCallback(() => {
    if (!currentStep.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(currentStep.selector);
    if (!el) {
      setRect(null);
      return;
    }
    setRect(getRect(el));
  }, [currentStep.selector]);

  useEffect(() => {
    if (hasSeenTour || !isAuthenticated) return;

    // Clean up previous observer
    observerRef.current?.disconnect();
    setRect(null);

    if (!currentStep.selector) return;

    const el = document.querySelector(currentStep.selector);
    if (!el) return;

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    observerRef.current = ro;

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, hasSeenTour, isAuthenticated, currentStep.selector, measure]);

  // Keyboard navigation
  useEffect(() => {
    if (hasSeenTour || !isAuthenticated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if ((e.key === "ArrowRight" || e.key === "Enter") && !isLast)
        setStep((s) => s + 1);
      if (e.key === "ArrowLeft" && !isFirst) setStep((s) => s - 1);
      if ((e.key === "ArrowRight" || e.key === "Enter") && isLast) finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasSeenTour, isAuthenticated, isFirst, isLast, finish]);

  if (hasSeenTour || !isAuthenticated) return null;

  // ── Tooltip positioning ────────────────────────────────────────────────────
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let tooltipStyle: React.CSSProperties = {};

  if (rect) {
    const spaceBelow = vh - (rect.top + rect.height);
    const spaceRight = vw - (rect.left + rect.width);

    if (spaceBelow >= 180) {
      // Place below
      tooltipStyle = {
        position: "fixed",
        top: rect.top + rect.height + 12,
        left: Math.min(Math.max(rect.left, 16), vw - 316),
      };
    } else if (rect.top >= 180) {
      // Place above
      tooltipStyle = {
        position: "fixed",
        bottom: vh - rect.top + 12,
        left: Math.min(Math.max(rect.left, 16), vw - 316),
      };
    } else if (spaceRight >= 316) {
      // Place right
      tooltipStyle = {
        position: "fixed",
        top: Math.min(Math.max(rect.top, 16), vh - 200),
        left: rect.left + rect.width + 12,
      };
    } else {
      // Place left
      tooltipStyle = {
        position: "fixed",
        top: Math.min(Math.max(rect.top, 16), vh - 200),
        right: vw - rect.left + 12,
      };
    }
  } else {
    // Centred
    tooltipStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const spotlightShadow = rect
    ? `0 0 0 9999px rgba(0,0,0,0.55)`
    : undefined;

  return (
    <>
      {/* Overlay — only when spotlight is active; centred steps use a full dim */}
      {isCentred ? (
        <div className="fixed inset-0 z-[9000] bg-black/55" />
      ) : null}

      {/* Spotlight cutout */}
      {rect && (
        <div
          style={{
            position: "fixed",
            zIndex: 9001,
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: 8,
            boxShadow: spotlightShadow,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{ ...tooltipStyle, zIndex: 9002, width: 300 }}
        className="rounded-xl border border-stripe-border bg-white shadow-2xl"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "inline-block h-1.5 rounded-full transition-all duration-200",
                  i === step
                    ? "w-4 bg-stripe-purple"
                    : i < step
                    ? "w-1.5 bg-stripe-purple/40"
                    : "w-1.5 bg-gray-200"
                )}
              />
            ))}
          </div>
          <button
            onClick={finish}
            className="rounded p-1 text-stripe-text-secondary hover:bg-gray-100 hover:text-stripe-text-primary transition-colors"
            aria-label="Skip tour"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-2">
          <p className="text-sm font-semibold text-stripe-text-primary mb-1">
            {currentStep.title}
          </p>
          <p className="text-sm text-stripe-text-secondary leading-relaxed">
            {currentStep.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-stripe-border px-4 py-3">
          <button
            onClick={finish}
            className="text-xs text-stripe-text-secondary hover:text-stripe-text-primary transition-colors"
          >
            Skip tour
          </button>

          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 rounded-md border border-stripe-border px-3 py-1.5 text-xs font-medium text-stripe-text-primary hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="size-3" />
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="flex items-center gap-1 rounded-md bg-stripe-purple px-3 py-1.5 text-xs font-medium text-white hover:bg-stripe-purple/90 transition-colors"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ArrowRight className="size-3" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
