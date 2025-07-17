export default function FishIcon({ isMenuOpen }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class={`fish-icon ${isMenuOpen() ? "rotated" : ""}`}
    >
      <path
        d="M2 12C2 12 4.5 8 8 8C11.5 8 14 10 16 10C18 10 20.5 8 22 12C20.5 16 18 14 16 14C14 14 11.5 16 8 16C4.5 16 2 12 2 12Z"
        fill="currentColor"
      />
      <path
        d="M8 10C8.55228 10 9 10.4477 9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10Z"
        fill="white"
      />
      <path
        d="M16 10L19 7M16 14L19 17"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
