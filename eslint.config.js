// ESLint flat-config. Минимальный набор: typescript-eslint recommended +
// react-hooks rules + выключение всех stylistic правил через prettier.
// Цель — ловить реальные баги (неиспользованные импорты, нарушения правил
// хуков), а не стилистику; форматирование отдаёт Prettier.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".local/**",
      "attached_assets/**",
      ".claude/**",
      "tests/**/fixtures/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Мы активно используем паттерн `_err` / `_ctx` в onError и
      // destructure-discards типа `const { updatedAt: _, ...rest }`. Разрешаем
      // префикс `_` как маркер «намеренно не использую».
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // В коде довольно много `as any` для Drizzle-JSONB и legacy-совместимости;
      // ловить их как error преждевременно — понижаем до warn.
      "@typescript-eslint/no-explicit-any": "warn",
      // `empty catch {}` используется в fire-and-forget cacheCharacter(...).catch(() => {})
      "no-empty": ["warn", { allowEmptyCatch: true }],
      // eslint-plugin-react-hooks v5 добавил агрессивные правила про setState в
      // useEffect и ref-access-during-render. В текущей кодовой базе
      // несколько мест используют эти паттерны намеренно (sync-ref по PATCH-ответу,
      // debounced save flush). Понижаем в warn на этапе встраивания линта;
      // отдельный PR разберёт каждое место по делу.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      // @ts-ignore vs @ts-expect-error — тоже стилистика; в проекте уже есть
      // несколько @ts-ignore на legacy-конвертерах. Warn.
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
  prettier,
];
