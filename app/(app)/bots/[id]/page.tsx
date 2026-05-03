import { BotDetailScreen } from '@wsp/bots/UI/BotDetailScreen';

export const metadata = { title: 'Bot detail · waHub' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BotDetailPage({ params }: Props) {
  const { id } = await params;
  return <BotDetailScreen botId={id} />;
}
