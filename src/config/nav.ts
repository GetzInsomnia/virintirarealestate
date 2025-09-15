export interface NavItem {
  title: string
  href?: string
  children?: NavItem[]
}

export const NAV_MAIN: NavItem[] = [
  { title: 'Home', href: '/' },
  {
    title: 'Properties',
    children: [
      { title: 'Buy', href: '/buy' },
      { title: 'Rent', href: '/rent' },
    ],
  },
  { title: 'Contact', href: '/contact' },
]
