import { GetStaticPropsContext } from "next";
export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../locales/${locale}/common.json`)).default,
    },
  };
}
