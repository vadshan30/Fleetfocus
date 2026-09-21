export const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'DRIVER', 'TECHNICIAN'],
  },
  {
    path: '/vehicles',
    label: 'Vehicles',
    icon: 'Truck',
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'TECHNICIAN'],
  },
  {
    path: '/drivers',
    label: 'Drivers',
    icon: 'Users',
    roles: ['FLEET_MANAGER', 'DISPATCHER'],
  },
  {
    path: '/trips',
    label: 'Trips',
    icon: 'MapPin',
    roles: ['FLEET_MANAGER', 'DISPATCHER'],
  },
  {
    path: '/my-trips',
    label: 'My Trips',
    icon: 'MapPin',
    roles: ['DRIVER'],
  },
  {
    path: '/my-vehicle',
    label: 'My Vehicle',
    icon: 'Truck',
    roles: ['DRIVER'],
  },
  {
    path: '/maintenance',
    label: 'Maintenance',
    icon: 'Wrench',
    roles: ['FLEET_MANAGER', 'TECHNICIAN'],
  },
  {
    path: '/live-fleet',
    label: 'Live Fleet',
    icon: 'Radio',
    roles: ['FLEET_MANAGER', 'DISPATCHER'],
  },
  {
    path: '/playback',
    label: 'Playback',
    icon: 'History',
    roles: ['FLEET_MANAGER', 'DISPATCHER'],
  },
  {
    path: '/alerts',
    label: 'Alerts',
    icon: 'Bell',
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'TECHNICIAN'],
  },
  {
    path: '/settings/alerts',
    label: 'Alert Rules',
    icon: 'Settings',
    roles: ['FLEET_MANAGER'],
  },
];
