import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function BackButton({ to = '/' }: { to?: string }) {
  const navigate = useNavigate();

  return (
    <Button variant="ghost" size="sm" onClick={() => navigate(to)}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar
    </Button>
  );
}
