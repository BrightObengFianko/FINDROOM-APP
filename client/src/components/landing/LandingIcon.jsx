import {
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Headphones,
  Home,
  MapPin,
  MessageSquareText,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'

const icons = {
  badge: BadgeCheck,
  bed: BedDouble,
  calendar: CalendarDays,
  headphones: Headphones,
  home: Home,
  mapPin: MapPin,
  message: MessageSquareText,
  search: Search,
  shield: ShieldCheck,
  users: Users,
}

function LandingIcon({ name, className, size = 16 }) {
  const IconComponent = icons[name]

  if (!IconComponent) {
    return null
  }

  return <IconComponent className={className} size={size} strokeWidth={2} />
}

export default LandingIcon
