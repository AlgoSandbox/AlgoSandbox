export function AppIcon() {
  return (
    <svg
      className="w-16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 100 74"
    >
      <path
        d="M50 15 0 39v11l50 24 50-24V39L50 15z"
        className="fill-black dark:fill-white"
      />
      <path
        d="M50 20 9.83 39.281 50 58.563 90.17 39.28Z"
        className="fill-white dark:fill-black"
      />
      <circle
        cx="77"
        cy="10"
        r="8"
        className="stroke-black dark:stroke-white fill-white dark:fill-black"
        stroke-width="4"
      />
      <circle
        cx="50"
        cy="39"
        r="6"
        className="stroke-black dark:stroke-white fill-black dark:fill-white"
        stroke-width="4"
      />
      <path
        className="stroke-black dark:stroke-white"
        stroke-width="4"
        d="m49.618 37.555 23-22m25.799 24.668-17-22"
      />
    </svg>
  );
}

export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <AppIcon />
      <span className="font-semibold tracking-tight shrink-0">
        algo sandbox
      </span>
    </div>
  );
}
