import type { IConversation, IMessage } from '../Domain/IConversation';

export const MOCK_CONVS: IConversation[] = [
  { id: 'c1', name: 'María González', num: '+52 55 1234 5678', last: 'Perfecto, mañana a las 10am entonces 🙏', time: '2m', unread: 2, ai: true, init: 'MG', tags: ['cliente', 'cdmx'] },
  { id: 'c2', name: 'Carlos Mendoza', num: '+52 81 8765 4321', last: '¿Tienen disponible la talla M en azul?', time: '8m', unread: 1, ai: true, init: 'CM', tags: ['cliente'] },
  { id: 'c3', name: 'Sofía Ramírez', num: '+52 33 1122 3344', last: 'Voy en camino, llego en 5', time: '14m', unread: 0, ai: false, init: 'SR', tags: ['vip'] },
  { id: 'c4', name: 'Andrés Torres', num: '+1 415 555 0199', last: 'Bot: Te he enviado el catálogo en PDF', time: '1h', unread: 0, ai: true, init: 'AT', tags: [] },
  { id: 'c5', name: 'Lucía Fernández', num: '+52 55 9988 7766', last: 'Gracias, ya recibí el código', time: '2h', unread: 0, ai: true, init: 'LF', tags: ['nuevo'] },
  { id: 'c6', name: 'Roberto Silva', num: '+52 55 4433 2211', last: 'Quisiera agendar una cita para el viernes', time: '3h', unread: 0, ai: true, init: 'RS', tags: [] },
  { id: 'c7', name: 'Daniela López', num: '+52 81 3322 1100', last: '¿Hacen envíos a Monterrey?', time: '5h', unread: 0, ai: true, init: 'DL', tags: ['lead'] },
  { id: 'c8', name: 'Javier Ortiz', num: '+52 33 9988 7766', last: 'Listo, transfencia hecha 💸', time: 'Yer', unread: 0, ai: false, init: 'JO', tags: ['cliente'] },
];

export const MOCK_MESSAGES: IMessage[] = [
  { from: 'in', text: 'Hola! Vi su anuncio de las botas de cuero ¿están disponibles?', time: '14:02' },
  { from: 'bot', text: '¡Hola María! 👋 Sí, tenemos las botas de cuero disponibles. ¿Te interesa algún color o talla en particular?', time: '14:02', ai: true },
  { from: 'in', text: 'Negras, talla 25', time: '14:05' },
  { from: 'bot', text: 'Tengo en stock las botas modelo Sierra en negro talla 25 a $1,890 MXN. ¿Te gustaría apartar un par o ver otros modelos similares?', time: '14:05', ai: true },
  { from: 'in', text: 'Apártalas porfa, ¿puedo recogerlas mañana?', time: '14:07' },
  { from: 'bot', text: 'Claro María. Te aparto el par hasta mañana. Nuestra tienda abre de 10am a 8pm en Polanco. ¿A qué hora te queda mejor pasar?', time: '14:07', ai: true },
  { from: 'in', text: 'A las 10am estoy ahí', time: '14:09' },
  { from: 'out', text: '¡Perfecto María! Te esperamos a las 10am con tus botas Sierra negras talla 25 listas. Cualquier cosa me avisas por aquí. 🙌', time: '14:09', who: 'Diego' },
  { from: 'in', text: 'Perfecto, mañana a las 10am entonces 🙏', time: '14:10' },
];
