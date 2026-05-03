import type { IBot } from '../Domain/IBot';

// Mock data — to be replaced by RepositoryImpl calling backend.
export const MOCK_BOTS: IBot[] = [
  { id: 'bot_acme', name: 'Acme Support', number: '+52 55 1234 5678', status: 'online', conv: 1247, msg24: 8932, ai: true, since: 'Apr 18', initials: 'AS' },
  { id: 'bot_lunaria', name: 'Lunaría Boutique', number: '+52 81 9988 1122', status: 'online', conv: 463, msg24: 2104, ai: true, since: 'Apr 22', initials: 'LB' },
  { id: 'bot_dental', name: 'Dental Norte', number: '+52 33 4455 6677', status: 'online', conv: 89, msg24: 412, ai: false, since: 'Apr 25', initials: 'DN' },
  { id: 'bot_skyride', name: 'SkyRide Logistics', number: '+1 415 555 0142', status: 'warn', conv: 2103, msg24: 14502, ai: true, since: 'Mar 02', initials: 'SR' },
  { id: 'bot_bistro', name: 'Bistró del Valle', number: '+52 55 7788 9900', status: 'idle', conv: 28, msg24: 0, ai: false, since: 'Apr 28', initials: 'BV' },
];
