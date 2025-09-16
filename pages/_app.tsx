import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { DefaultSeo } from "next-seo";
import JsonLd from "../components/JsonLd";
import { useRouter } from "next/router";
import { buildUrl } from "../lib/url";
import defaultSeo from "../next-seo.config";
import { CurrencyProvider } from "../src/context/CurrencyContext";
import { prompt, inter } from "../src/styles/fonts";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import FloatingContacts from "@/src/components/FloatingContacts";

function useNavDirection() {
  const router = useRouter();
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const currentIndex = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = router.asPath;
    const map = JSON.parse(sessionStorage.getItem("nav-index") || "{}");
    if (map[path] == null) {
      const nextIndex = Object.keys(map).length;
      map[path] = nextIndex;
      sessionStorage.setItem("nav-index", JSON.stringify(map));
      currentIndex.current = nextIndex;
    } else {
      currentIndex.current = map[path];
    }

    const handleRouteChange = (url: string) => {
      const stored = JSON.parse(sessionStorage.getItem("nav-index") || "{}");
      if (stored[url] == null) {
        const nextIndex = Object.keys(stored).length;
        stored[url] = nextIndex;
        sessionStorage.setItem("nav-index", JSON.stringify(stored));
        setDirection("forward");
        currentIndex.current = nextIndex;
      } else {
        const nextIndex = stored[url];
        setDirection(nextIndex > currentIndex.current ? "forward" : "back");
        currentIndex.current = nextIndex;
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  return direction;
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale, defaultLocale } = router;
  const direction = useNavDirection();
  const prefersReducedMotion = useReducedMotion();

  const { baseUrl, siteUrl } = buildUrl(locale ?? defaultLocale);
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zomzom Property",
    url: siteUrl,
    logo: `${baseUrl}/favicon.ico`,
    sameAs: [
      "https://twitter.com/zomzomproperty",
      "https://www.facebook.com/zomzomproperty",
    ],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zomzom Property",
    url: siteUrl,
  };

  const variants = {
    forward: {
      hidden: { x: 100, opacity: 0 },
      enter: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
    },
    back: {
      hidden: { x: -100, opacity: 0 },
      enter: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 },
    },
    fade: {
      hidden: { opacity: 0 },
      enter: { opacity: 1 },
      exit: { opacity: 0 },
    },
  } as const;

  const variantKey = prefersReducedMotion ? "fade" : direction;

  return (
    <div className={`${prompt.variable} ${inter.variable}`}>
      <DefaultSeo {...defaultSeo} />
      <JsonLd scriptId="organization-jsonld" {...orgJsonLd} />
      <JsonLd scriptId="website-jsonld" {...webSiteJsonLd} />
      <CurrencyProvider>
        <FloatingContacts />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.asPath}
            variants={variants[variantKey]}
            initial="hidden"
            animate="enter"
            exit="exit"
            transition={{ type: "tween", duration: 0.2 }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </CurrencyProvider>
    </div>
  );
}

export default appWithTranslation(MyApp);
