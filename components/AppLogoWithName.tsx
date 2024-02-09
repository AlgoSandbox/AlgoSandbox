import AppLogo from './AppLogo';

export default function AppLogoWithName() {
  return (
    <div className="flex items-center gap-2">
      <AppLogo className="w-6" />
      <span className="font-semibold tracking-tight text-accent shrink-0">
        algo sandbox
      </span>
    </div>
  );
}
