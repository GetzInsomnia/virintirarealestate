import Link from "next/link";
import { useRouter } from "next/router";

export function LanguageSwitcher() {
  const { asPath } = useRouter();
  const pathname = asPath.split("?")[0];
  const segments = pathname.split("/");
  const currentLang = segments[1] || "th";
  const rest = segments.slice(2).join("/");
  const toPath = (lang: string) => `/${lang}${rest ? `/${rest}` : ""}`;
  return (
    <div>
      <Link href={toPath("th")}> <button disabled={currentLang === "th"}>ไทย</button> </Link>{" "}
      <Link href={toPath("en")}> <button disabled={currentLang === "en"}>English</button> </Link>
    </div>
  );
}
