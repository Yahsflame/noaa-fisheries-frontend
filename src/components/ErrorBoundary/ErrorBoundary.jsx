import { ErrorBoundary as SolidErrorBoundary } from "solid-js";
import "./ErrorBoundary.css";

export default function ErrorBoundary(props) {
  return (
    <SolidErrorBoundary
      fallback={(err, reset) => (
        <div class="error-boundary">
          <div class="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button class="error-boundary-button" onClick={reset}>
              Try again
            </button>
            <p>
              <a href="/">
                Or click here to return home
              </a>
            </p>
            <details class="error-boundary-details">
              <summary>Error details</summary>
              <pre class="error-boundary-pre">{err.message}</pre>
            </details>
          </div>
        </div>
      )}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}
