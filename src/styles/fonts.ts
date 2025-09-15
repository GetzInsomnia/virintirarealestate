import localFont from "next/font/local";
import { Noto_Sans_SC } from "next/font/google";

export const prompt = localFont({
  variable: "--font-prompt",
  src: [
    { path: "../../public/fonts/Prompt/Prompt-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-ExtraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-Black.ttf", weight: "900", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-BlackItalic.ttf", weight: "900", style: "italic" }
  ]
});

export const inter = localFont({
  variable: "--font-inter",
  src: [
    { path: "../../public/fonts/Inter/Inter_18pt-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-ExtraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-Black.ttf", weight: "900", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-BlackItalic.ttf", weight: "900", style: "italic" }
  ]
});

export const notoSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "700"]
});

export const FONT_STACKS = {
  en: `${inter.style.fontFamily}, sans-serif`,
  th: `${prompt.style.fontFamily}, sans-serif`,
  sc: `${notoSC.style.fontFamily}, sans-serif`
};

