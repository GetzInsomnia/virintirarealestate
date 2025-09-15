import JsonLd from '@/components/JsonLd';
import type { Crumb } from '@/src/lib/nav/crumbs';

interface Props {
  items: Crumb[];
  scriptId?: string;
}

export default function BreadcrumbJsonLd({ items, scriptId = 'breadcrumbs-jsonld' }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  };
  return <JsonLd scriptId={scriptId} {...jsonLd} />;
}
