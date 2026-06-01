export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Browse Rooms', to: '/rooms' },
  { label: 'For Landlords', href: '#landlords' },
  { label: 'About us', href: '#about' },
  { label: 'Contact us', href: '#contact' },
]

export const trustIndicators = [
  { label: 'Verified listings', colorClass: 'text-brand-500', icon: 'badge' },
  { label: 'Safe payment', colorClass: 'text-[#f59e0b]', icon: 'shield' },
  { label: 'Trusted landlords', colorClass: 'text-brand-500', icon: 'users' },
  { label: '24/7 support', colorClass: 'text-[#38a6ff]', icon: 'headphones' },
]

export const howItWorksSteps = [
  {
    number: '1.',
    title: 'Search',
    description: 'Browse rooms that match your needs and budget.',
    icon: 'search',
  },
  {
    number: '2.',
    title: 'Connect',
    description: 'Message, ask questions, and confirm details fast.',
    icon: 'message',
  },
  {
    number: '3.',
    title: 'Book',
    description: 'Choose your room and secure it easily.',
    icon: 'calendar',
  },
  {
    number: '4.',
    title: 'Move in',
    description: 'Move in and enjoy your new space.',
    icon: 'home',
  },
]

export const popularAreas = [
  {
    title: 'East Legon',
    rooms: '120+ rooms',
    image: '/landing/east-legon.jpg',
  },
  {
    title: 'Madina',
    rooms: '80+ rooms',
    image: '/landing/madina.jpg',
  },
  {
    title: 'Spintex',
    rooms: '90+ rooms',
    image: '/landing/spintex.jpg',
  },
  {
    title: 'Tema',
    rooms: '60+ rooms',
    image: '/landing/tema.jpg',
  },
]

export const footerColumns = [
  {
    title: 'Company',
    widthClass: 'max-w-[220px]',
    links: ['About Us', 'Careers', 'Contact us'],
  },
  {
    title: 'Support',
    widthClass: 'max-w-[240px]',
    links: ['Help Center', 'Safety Tips', 'Terms & Policies'],
  },
  {
    title: 'For landlord',
    widthClass: 'max-w-[170px]',
    links: ['List Your Property', 'Landlord Guide', 'Resource'],
  },
]
