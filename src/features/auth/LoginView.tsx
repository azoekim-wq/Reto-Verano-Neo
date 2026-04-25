import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LoginView({ onGoogle }: { onGoogle?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-acid flex items-center justify-center">
            <Flame className="w-7 h-7 text-black" />
          </div>
        </div>
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl tracking-tight">
            RETO<span className="text-acid">/</span>VERANO
          </h1>
          <p className="text-zinc-400 mt-3">Entra con tu cuenta del equipo de I+D.</p>
        </div>
        <div className="card p-6 space-y-3">
          <Button variant="primary" size="lg" className="w-full" onClick={onGoogle}>
            Continuar con Google
          </Button>
          <Button variant="ghost" size="lg" className="w-full">
            Continuar con Microsoft
          </Button>
        </div>
        <p className="text-[11px] text-center text-zinc-600 mt-6">
          Al entrar aceptas tratar tus datos de peso y composición corporal de forma privada y
          conforme al RGPD.
        </p>
      </div>
    </div>
  );
}
