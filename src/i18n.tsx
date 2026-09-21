import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./locales/en";
import { errorEnglish } from "./locales/errors";
import { messagePatterns, sharedEnglish } from "./locales/uiTemplates.en";

export enum Locale {
  Chinese = "zh-CN",
  English = "en",
}
const preferenceKey = "wellnest.locale";
const dictionary = { ...en, ...sharedEnglish, ...errorEnglish };
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const patterns = messagePatterns.map(([source, target]) => {
  const names: string[] = [];
  const pattern = source
    .split(/(\{\w+\})/)
    .map((part) => {
      if (/^\{\w+\}$/.test(part)) {
        names.push(part.slice(1, -1));
        return "(.+?)";
      }
      return escapeRegExp(part);
    })
    .join("");
  return { pattern: new RegExp(`^${pattern}$`), names, target };
});

export function translate(value: string, locale: Locale): string {
  if (locale === Locale.Chinese) return value;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (dictionary[normalized] !== undefined) return dictionary[normalized];
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized))
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${normalized}T00:00:00Z`));
  for (const { pattern, names, target } of patterns) {
    const match = normalized.match(pattern);
    if (match)
      return target.replace(/\{(\w+)\}/g, (_, key: string) =>
        translate(match[names.indexOf(key) + 1], locale),
      );
  }
  // UI feedback can combine local sentences and selected labels.
  if (normalized.includes("。")) {
    const sentences = normalized.match(/[^。]+。?/g) ?? [];
    if (sentences.length > 1)
      return sentences.map((sentence) => translate(sentence, locale)).join(" ");
  }
  for (const separator of ["、", " · ", "，"])
    if (normalized.includes(separator)) {
      const fragments = normalized.split(separator);
      const translated = fragments.map((fragment) =>
        translate(fragment, locale),
      );
      if (translated.every((fragment) => !/[\u4e00-\u9fff]/.test(fragment)))
        return translated.join(separator === " · " ? " · " : ", ");
    }
  if (dictionary[`${normalized}？`])
    return dictionary[`${normalized}？`].replace(/\?$/, "");
  return value;
}

type Translate = <T>(value: T) => T;
type Context = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
  formatNumber: (value: number) => string;
};
const I18nContext = createContext<Context | null>(null);
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem(preferenceKey) === Locale.English
        ? Locale.English
        : Locale.Chinese;
    } catch {
      return Locale.Chinese;
    }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === Locale.English
        ? "Wellnest · Your personal health assessment"
        : "Wellnest · 你的专属健康评估";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        locale === Locale.English
          ? "Understand your body and everyday habits. Find a starting point that fits your life."
          : "了解身体与生活习惯，找到适合自己的改变起点。",
      );
    try {
      localStorage.setItem(preferenceKey, locale);
    } catch {
      /* In-memory switching remains available. */
    }
  }, [locale]);
  const context = useMemo<Context>(
    () => ({
      locale,
      setLocale,
      t: <T,>(value: T): T =>
        typeof value === "string" ? (translate(value, locale) as T) : value,
      formatNumber: (value) =>
        new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
          value,
        ),
    }),
    [locale],
  );
  return (
    <I18nContext.Provider value={context}>{children}</I18nContext.Provider>
  );
}
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("I18nProvider is required");
  return context;
}
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={locale === Locale.English ? "Language" : "语言"}
    >
      <button
        lang="zh-CN"
        aria-pressed={locale === Locale.Chinese}
        onClick={() => setLocale(Locale.Chinese)}
      >
        中文
      </button>
      <button
        lang="en"
        aria-pressed={locale === Locale.English}
        onClick={() => setLocale(Locale.English)}
      >
        EN
      </button>
    </div>
  );
}
