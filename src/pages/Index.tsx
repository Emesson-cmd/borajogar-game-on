import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Zap, Link2 } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Link2,
      title: 'Link Compartilhável',
      description: 'Crie um evento e compartilhe o link no WhatsApp. Simples assim.',
    },
    {
      icon: Users,
      title: 'Sem Cadastro',
      description: 'Jogadores entram na lista sem precisar criar conta ou baixar app.',
    },
    {
      icon: Zap,
      title: 'Tempo Real',
      description: 'Lista atualiza automaticamente. Chega de confusão com quem vai jogar.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-16">
        <header className="flex items-center justify-between mb-16 md:mb-24">
          <Logo size="md" />
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
        </header>

        <main className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Organize seu
              <span className="text-gradient block mt-2">futebol semanal</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Chega de listas no WhatsApp. Crie um link, compartilhe com o grupo e deixe a galera confirmar presença sozinha.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-12 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">20</div>
              <div className="text-sm text-muted-foreground">Jogadores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-goalkeeper">4</div>
              <div className="text-sm text-muted-foreground">Goleiros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-waiting">∞</div>
              <div className="text-sm text-muted-foreground">Lista de Espera</div>
            </div>
          </div>
        </main>

        {/* Features */}
        <section className="mt-24 md:mt-32 grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-gradient-card rounded-2xl border border-border/50 p-6 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center text-muted-foreground text-sm">
          <p>© 2024 BoraJogar. Feito para organizadores de pelada.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
