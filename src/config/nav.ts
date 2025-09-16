export interface NavLink {
  title: string
  href: string
  description?: string
}

export interface NavSection {
  title: string
  description?: string
  items: NavLink[]
}

export interface NavItem {
  title: string
  href?: string
  description?: string
  sections?: NavSection[]
}

export const NAV_MAIN: NavItem[] = [
  {
    title: 'Buy',
    href: '/properties?status=sale',
    description: 'Explore properties for sale across Thailand.',
    sections: [
      {
        title: 'Popular areas',
        description: 'In-demand destinations for buyers.',
        items: [
          {
            title: 'Bangkok homes for sale',
            href: '/properties?status=sale&province=Bangkok',
            description: 'Luxury condos and city homes in the capital.',
          },
          {
            title: 'Phuket villas for sale',
            href: '/properties?status=sale&province=Phuket',
            description: 'Beachfront escapes and hillside retreats.',
          },
          {
            title: 'Pattaya homes for sale',
            href: '/properties?status=sale&province=Chon Buri',
            description: 'Resort properties along the eastern seaboard.',
          },
        ],
      },
      {
        title: 'Property types',
        description: 'Narrow listings to the format that suits you best.',
        items: [
          { title: 'Condos for sale', href: '/properties?status=sale&type=condo' },
          { title: 'Houses for sale', href: '/properties?status=sale&type=house' },
          { title: 'Townhouses for sale', href: '/properties?status=sale&type=townhouse' },
          { title: 'Land for sale', href: '/properties?status=sale&type=land' },
        ],
      },
      {
        title: 'Buyer resources',
        description: 'Understand the process and finance options.',
        items: [
          { title: 'National buying process', href: '/guides/national-buying-process' },
          { title: 'Thailand mortgage basics', href: '/guides/thailand-mortgage-basics' },
          { title: 'Bangkok tax advice', href: '/guides/bangkok-tax-advice' },
        ],
      },
    ],
  },
  {
    title: 'Rent',
    href: '/properties?status=rent',
    description: 'Find condos and houses available for lease.',
    sections: [
      {
        title: 'Top cities',
        description: 'Rental markets with the most active supply.',
        items: [
          { title: 'Bangkok rentals', href: '/properties?status=rent&province=Bangkok' },
          { title: 'Phuket rentals', href: '/properties?status=rent&province=Phuket' },
          { title: 'Pattaya rentals', href: '/properties?status=rent&province=Chon Buri' },
        ],
      },
      {
        title: 'By property type',
        description: 'Browse rentals by layout and amenities.',
        items: [
          { title: 'Condos for rent', href: '/properties?status=rent&type=condo' },
          { title: 'Houses for rent', href: '/properties?status=rent&type=house' },
          { title: 'Townhouses for rent', href: '/properties?status=rent&type=townhouse' },
        ],
      },
      {
        title: 'Rental advice',
        description: 'Stay informed before signing your next lease.',
        items: [
          { title: 'Pattaya townhouse rental guide', href: '/guides/pattaya-townhouse-rental' },
          { title: 'Bangkok condo renovation tips', href: '/guides/bangkok-condo-renovation' },
          { title: 'Chiang Mai market trends', href: '/guides/chiangmai-market-trends' },
        ],
      },
    ],
  },
  {
    title: 'Condos',
    href: '/properties?type=condo',
    description: 'Condominium listings and expert insights.',
    sections: [
      {
        title: 'Condos by area',
        description: 'Urban hotspots and coastal developments.',
        items: [
          { title: 'Bangkok condos', href: '/properties?type=condo&province=Bangkok' },
          { title: 'Phuket condos', href: '/properties?type=condo&province=Phuket' },
          { title: 'Pattaya condos', href: '/properties?type=condo&province=Chon Buri' },
        ],
      },
      {
        title: 'Plan your move',
        description: 'Guides to buying and maintaining condos.',
        items: [
          { title: 'Bangkok condo buying guide', href: '/guides/bangkok-condo-guide' },
          { title: 'Chiang Mai condo rules', href: '/guides/chiangmai-condo-rules' },
          { title: 'Bangkok condo renovation', href: '/guides/bangkok-condo-renovation' },
        ],
      },
      {
        title: 'Finance and legal',
        description: 'Navigate fees, financing, and ownership.',
        items: [
          { title: 'National buying process', href: '/guides/national-buying-process' },
          { title: 'Thailand mortgage basics', href: '/guides/thailand-mortgage-basics' },
          { title: 'Bangkok tax advice', href: '/guides/bangkok-tax-advice' },
        ],
      },
    ],
  },
  {
    title: 'Houses',
    href: '/properties?type=house',
    description: 'Detached homes, villas, and family estates.',
    sections: [
      {
        title: 'Houses by area',
        description: 'City and resort destinations with villas and homes.',
        items: [
          { title: 'Bangkok houses', href: '/properties?type=house&province=Bangkok' },
          { title: 'Phuket villas', href: '/properties?type=house&province=Phuket' },
          { title: 'Pattaya houses', href: '/properties?type=house&province=Chon Buri' },
        ],
      },
      {
        title: 'Inspiration',
        description: 'Homeownership tips from around Thailand.',
        items: [
          { title: 'Chiang Mai house tips', href: '/guides/chiangmai-house-tips' },
          { title: 'Phuket villa maintenance', href: '/guides/phuket-villa-maintenance' },
          { title: 'Phuket land investment', href: '/guides/phuket-land-investment' },
        ],
      },
      {
        title: 'Townhomes and land',
        description: 'Look beyond single-family homes.',
        items: [
          { title: 'Townhouses for sale', href: '/properties?type=townhouse' },
          { title: 'Land investment opportunities', href: '/properties?type=land' },
          { title: 'Phuket beachfront plots', href: '/guides/phuket-beachfront-plots' },
        ],
      },
    ],
  },
  {
    title: 'Areas',
    href: '/properties?province=Bangkok',
    description: 'Browse properties and guides by destination.',
    sections: [
      {
        title: 'Bangkok',
        description: 'Thailand’s vibrant capital and business hub.',
        items: [
          { title: 'Buy in Bangkok', href: '/properties?province=Bangkok&status=sale' },
          { title: 'Rent in Bangkok', href: '/properties?province=Bangkok&status=rent' },
          { title: 'Bangkok condos', href: '/properties?province=Bangkok&type=condo' },
          { title: 'Bangkok guides', href: '/guides/bangkok-condo-guide' },
        ],
      },
      {
        title: 'Phuket',
        description: 'Island living with world-class beaches.',
        items: [
          { title: 'Buy in Phuket', href: '/properties?province=Phuket&status=sale' },
          { title: 'Rent in Phuket', href: '/properties?province=Phuket&status=rent' },
          { title: 'Phuket villas', href: '/properties?province=Phuket&type=house' },
          { title: 'Phuket guides', href: '/guides/phuket-villa-maintenance' },
        ],
      },
      {
        title: 'Pattaya',
        description: 'Resort living on the eastern seaboard.',
        items: [
          { title: 'Buy in Pattaya', href: '/properties?province=Chon Buri&status=sale' },
          { title: 'Rent in Pattaya', href: '/properties?province=Chon Buri&status=rent' },
          { title: 'Pattaya condos', href: '/properties?province=Chon Buri&type=condo' },
          { title: 'Pattaya guides', href: '/guides/pattaya-townhouse-rental' },
        ],
      },
    ],
  },
  {
    title: 'Guides',
    href: '/guides',
    description: 'Research the Thai property market before you buy or rent.',
    sections: [
      {
        title: 'Buying essentials',
        description: 'Key steps and requirements for overseas buyers.',
        items: [
          { title: 'National buying process', href: '/guides/national-buying-process' },
          { title: 'Thailand mortgage basics', href: '/guides/thailand-mortgage-basics' },
          { title: 'Bangkok tax advice', href: '/guides/bangkok-tax-advice' },
        ],
      },
      {
        title: 'Area spotlights',
        description: 'Deep dives into Thailand’s favourite destinations.',
        items: [
          { title: 'Bangkok condo buying guide', href: '/guides/bangkok-condo-guide' },
          { title: 'Phuket villa maintenance', href: '/guides/phuket-villa-maintenance' },
          { title: 'Pattaya townhouse rental', href: '/guides/pattaya-townhouse-rental' },
        ],
      },
      {
        title: 'Investment insights',
        description: 'Stay ahead of market and development trends.',
        items: [
          { title: 'Chiang Mai market trends', href: '/guides/chiangmai-market-trends' },
          { title: 'Phuket land investment', href: '/guides/phuket-land-investment' },
          { title: 'Bangkok condo renovation', href: '/guides/bangkok-condo-renovation' },
        ],
      },
    ],
  },
]
