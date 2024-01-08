export default async function getPackageJson(
  packageName: string,
  version?: string,
) {
  const res = await fetch(
    `https://unpkg.com/${packageName}${
      version ? `@${version}` : ''
    }/package.json`,
  );
  const json = await res.json();

  return json;
}
