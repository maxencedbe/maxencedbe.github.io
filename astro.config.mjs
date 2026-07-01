// @ts-check
import { defineConfig } from 'astro/config';
import { createLogger } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react'

// Silence known-harmless deprecation warnings emitted by the @astrojs/react
// (vite:react-babel) plugin, which still passes esbuild options that Vite 8 /
// Rolldown now flag as deprecated. Only these exact messages are dropped; any
// other warning still comes through.
const SUPPRESSED_WARNINGS = [
  '`esbuild` option was specified by "vite:react-babel"',
  '`optimizeDeps.esbuildOptions` option was specified',
  'set `optimizeDeps.esbuildOptions` but this option is now deprecated',
];

const logger = createLogger();
const shouldSuppress = (msg) =>
  typeof msg === 'string' && SUPPRESSED_WARNINGS.some((s) => msg.includes(s));
const baseWarn = logger.warn.bind(logger);
const baseWarnOnce = logger.warnOnce.bind(logger);
logger.warn = (msg, opts) => { if (!shouldSuppress(msg)) baseWarn(msg, opts); };
logger.warnOnce = (msg, opts) => { if (!shouldSuppress(msg)) baseWarnOnce(msg, opts); };

// https://astro.build/config
export default defineConfig({
  site: 'https://maxencedbe.github.io',

  build: {
    format: 'directory',
  },

  vite: {
    customLogger: logger,
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ['.'],
      },
    },
  },

  integrations: [react()],

  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
