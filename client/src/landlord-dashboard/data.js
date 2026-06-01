import { formatCurrency } from '../utils/format'

export const landlordStats = [
  {
    id: 'total-listings',
    label: 'Total Listings',
    value: '8',
    hint: 'Active listings',
  },
  {
    id: 'upcoming-bookings',
    label: 'Upcoming Bookings',
    value: '5',
    hint: 'Next 30 days',
  },
  {
    id: 'unread-messages',
    label: 'Unread Messages',
    value: '3',
    hint: 'New messages',
  },
  {
    id: 'total-earnings',
    label: 'Total Earnings',
    value: formatCurrency(12450),
    hint: 'This month',
  },
]

export const recentBookings = [
  {
    id: 'booking-modern',
    property: 'Modern Apartment in Downtown',
    guest: 'Mary Johnson',
    dates: 'May 20 - May 24, 2025',
    amount: formatCurrency(480),
    status: 'Confirmed',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'booking-cove',
    property: 'Cozy Villa with Sea View',
    guest: 'David Smith',
    dates: 'May 18 - May 22, 2025',
    amount: formatCurrency(760),
    status: 'Confirmed',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'booking-cabin',
    property: 'Relaxing Cabin in the Woods',
    guest: 'Emily Davis',
    dates: 'May 15 - May 17, 2025',
    amount: formatCurrency(320),
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'booking-studio',
    property: 'Stylish Studio Apartment',
    guest: 'James Brown',
    dates: 'May 12 - May 14, 2025',
    amount: formatCurrency(210),
    status: 'Confirmed',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=240&q=80',
  },
]

export const listings = [
  {
    id: 'listing-modern',
    title: 'Modern Apartment in Downtown',
    location: 'Downtown, New York',
    price: formatCurrency(480),
    unit: '/ month',
    bookings: 12,
    views: 340,
    earnings: formatCurrency(5760),
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'listing-cove',
    title: 'Cozy Villa with Sea View',
    location: 'Miami, Florida',
    price: formatCurrency(760),
    unit: '/ month',
    bookings: 8,
    views: 210,
    earnings: formatCurrency(6080),
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'listing-cabin',
    title: 'Relaxing Cabin in the Woods',
    location: 'Denver, Colorado',
    price: formatCurrency(320),
    unit: '/ month',
    bookings: 5,
    views: 150,
    earnings: formatCurrency(1600),
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'listing-studio',
    title: 'Stylish Studio Apartment',
    location: 'Austin, Texas',
    price: formatCurrency(210),
    unit: '/ month',
    bookings: 2,
    views: 80,
    earnings: formatCurrency(420),
    status: 'Inactive',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=240&q=80',
  },
]

export const bookings = [
  {
    id: 'table-booking-1',
    property: 'Modern Apartment in Downtown',
    guest: 'Mary Johnson',
    email: 'mary@demo.com',
    phone: '+1 234 567 8900',
    dates: ['May 20, 2025', 'May 24, 2025'],
    amount: formatCurrency(480),
    status: 'Confirmed',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'table-booking-2',
    property: 'Cozy Villa with Sea View',
    guest: 'David Smith',
    email: 'david@demo.com',
    phone: '+1 234 567 0001',
    dates: ['May 18, 2025', 'May 22, 2025'],
    amount: formatCurrency(760),
    status: 'Confirmed',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'table-booking-3',
    property: 'Relaxing Cabin in the Woods',
    guest: 'Emily Davis',
    email: 'emily@demo.com',
    phone: '+1 234 567 0002',
    dates: ['May 15, 2025', 'May 17, 2025'],
    amount: formatCurrency(320),
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'table-booking-4',
    property: 'Stylish Studio Apartment',
    guest: 'James Brown',
    email: 'james@demo.com',
    phone: '+1 234 567 0003',
    dates: ['May 12, 2025', 'May 14, 2025'],
    amount: formatCurrency(210),
    status: 'Confirmed',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'table-booking-5',
    property: 'Modern Apartment in Downtown',
    guest: 'Michael Lee',
    email: 'michael@demo.com',
    phone: '+1 234 567 0004',
    dates: ['May 5, 2025', 'May 7, 2025'],
    amount: formatCurrency(480),
    status: 'Cancelled',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80',
  },
]

export const bookingTabs = [
  'All',
  'Pending',
  'Confirmed',
  'Cancelled',
  'Completed',
]

export const conversations = [
  {
    id: 'conversation-mary',
    name: 'Mary Johnson',
    preview: 'Hi, I have a question about the property...',
    time: '10:20 AM',
    active: true,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'conversation-david',
    name: 'David Smith',
    preview: 'Thank you!',
    time: 'Yesterday',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'conversation-emily',
    name: 'Emily Davis',
    preview: 'Can I check in early?',
    time: 'May 15',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'conversation-james',
    name: 'James Brown',
    preview: 'Perfect, see you soon.',
    time: 'May 14',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'conversation-michael',
    name: 'Michael Lee',
    preview: 'Is parking included?',
    time: 'May 10',
    avatar:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=120&q=80',
  },
]

export const chatMessages = [
  {
    id: 'chat-1',
    text: 'Hi, I have a question about the property.',
    time: '10:32 AM',
    mine: false,
  },
  {
    id: 'chat-2',
    text: 'Hello! Sure, how can I help you?',
    time: '10:32 AM',
    mine: true,
  },
  {
    id: 'chat-3',
    text: 'Is early check-in possible?',
    time: '10:33 AM',
    mine: false,
  },
  {
    id: 'chat-4',
    text: 'Yes, early check-in is possible. You can check in from 12 PM.',
    time: '10:34 AM',
    mine: true,
  },
]

export const earningsSummary = [
  {
    id: 'earnings-total',
    label: 'Total Earnings',
    value: formatCurrency(12450),
    hint: '16% vs last month',
    link: null,
  },
  {
    id: 'earnings-completed',
    label: 'Completed Payouts',
    value: formatCurrency(10200),
    hint: null,
    link: 'View payouts',
  },
  {
    id: 'earnings-pending',
    label: 'Pending Payouts',
    value: formatCurrency(2250),
    hint: null,
    link: 'View pending',
  },
]

export const transactions = [
  {
    id: 'transaction-1',
    date: 'May 29, 2025',
    property: 'Modern Apartment in Downtown',
    amount: formatCurrency(480),
    status: 'Completed',
  },
  {
    id: 'transaction-2',
    date: 'May 22, 2025',
    property: 'Cozy Villa with Sea View',
    amount: formatCurrency(760),
    status: 'Completed',
  },
  {
    id: 'transaction-3',
    date: 'May 17, 2025',
    property: 'Relaxing Cabin in the Woods',
    amount: formatCurrency(320),
    status: 'Pending',
  },
  {
    id: 'transaction-4',
    date: 'May 14, 2025',
    property: 'Stylish Studio Apartment',
    amount: formatCurrency(210),
    status: 'Completed',
  },
  {
    id: 'transaction-5',
    date: 'May 07, 2025',
    property: 'Modern Apartment in Downtown',
    amount: formatCurrency(480),
    status: 'Completed',
  },
]

export const listingAmenities = [
  'WiFi',
  'Parking',
  'Air Conditioning',
  'Heating',
  'Furnished',
  'TV',
  'Kitchen',
  'Swimming Pool',
]
