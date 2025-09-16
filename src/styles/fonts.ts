import localFont from "next/font/local";

export const prompt = localFont({
  variable: "--font-prompt",
  src: [
    { path: "../../public/fonts/Prompt/Prompt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/Prompt/Prompt-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Prompt/Prompt-BoldItalic.ttf", weight: "700", style: "italic" },
  ]
});

export const inter = localFont({
  variable: "--font-inter",
  src: [
    { path: "../../public/fonts/Inter/Inter_18pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/Inter/Inter_18pt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Inter/Inter_18pt-SemiBoldItalic.ttf", weight: "600", style: "italic" },
  ]
});

export const FONT_STACKS = {
  en: `${inter.style.fontFamily}, sans-serif`,
  th: `${prompt.style.fontFamily}, sans-serif`,
  sc: `"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif`
};

