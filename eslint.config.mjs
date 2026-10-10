import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Advisory rule added in eslint-plugin-react-hooks v6. Two existing
      // patterns depend on setting state once after mount:
      //   - theme-toggle: the canonical next-themes hydration guard (useTheme()
      //     is undefined on the server, so the real control must render only
      //     after hydration to avoid a mismatch)
      //   - stat-card: the reduced-motion fallback branch of an effect whose
      //     main job is driving an external Motion animation
      // Both are intentional; rewriting them would change behaviour.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
