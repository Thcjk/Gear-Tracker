/**
 * Statischer Export für GitHub Pages.
 *
 * basePath/assetPrefix entsprechen dem Repo-Namen, damit die App unter
 * https://<username>.github.io/Gear-Tracker/ korrekt lädt. Der Wert wurde aus
 * `git remote get-url origin` ermittelt.
 */
const repoName = "Gear-Tracker";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
  trailingSlash: true,
  images: { unoptimized: true },
  // Damit Manifest-, Icon- und Splash-Pfade im App-Code denselben Präfix
  // benutzen wie der Router, statt ihn ein zweites Mal zu verdrahten.
  env: {
    NEXT_PUBLIC_BASE_PATH: `/${repoName}`,
  },
};

module.exports = nextConfig;
