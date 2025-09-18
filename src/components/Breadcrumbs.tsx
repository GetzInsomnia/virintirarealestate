import Link from 'next/link';
import type { Crumb } from '@/lib/nav/crumbs';

interface Props {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li
            key={item.href + index}
            {...(index === items.length - 1 ? { 'aria-current': 'page' } : {})}
          >
            {index === items.length - 1 ? (
              <span>{item.label}</span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
