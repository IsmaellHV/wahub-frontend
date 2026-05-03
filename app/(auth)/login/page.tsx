import { AuthScreen } from '@acceso/usuarios/UI/AuthScreen';

export const metadata = { title: 'Sign in · waHub' };

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
