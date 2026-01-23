import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useParticipantProfile } from '@/hooks/useParticipantProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { validateCPF } from '@/shared/utils/validate-cpf';
import { getErrorMessage } from '@/shared/errors/sign-in';

type AuthMode = 'signin' | 'signup';

// CPF validation and formatting
const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const ParticipantAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const {
    profile,
    loading: profileLoading,
    createProfile,
    hasProfile,
  } = useParticipantProfile();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cellphone, setCellphone] = useState('');

  const [cpfError, setCpfError] = useState('');

  // Redirect if user is authenticated and has profile
  useEffect(() => {
    if (!authLoading && !profileLoading && user && hasProfile) {
      navigate(redirectTo);
    }
  }, [user, hasProfile, authLoading, profileLoading, navigate, redirectTo]);

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);

    if (formatted.length === 14) {
      if (!validateCPF(formatted)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(getErrorMessage(error.message));
    } else {
      toast.success('Login realizado com sucesso!');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName || !cpf) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!validateCPF(cpf)) {
      toast.error('CPF inválido');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    // First sign up
    const { error: signUpError } = await signUp(email, password);

    if (signUpError) {
      setLoading(false);
      toast.error(signUpError.message);
      return;
    }

    // Wait for auth to complete and create profile
    // The profile will be created after the user state updates
    setLoading(false);
    toast.success('Conta criada! Criando seu perfil...');
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !cpf) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!validateCPF(cpf)) {
      toast.error('CPF inválido');
      return;
    }

    setLoading(true);
    const success = await createProfile(
      fullName,
      cpf.replace(/\D/g, ''),
      cellphone.replace(/\D/g, ''),
    );
    setLoading(false);

    if (success) {
      navigate(redirectTo);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // User is logged in but needs to create profile
  if (user && !hasProfile) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Logo size="lg" />
            <h1 className="text-2xl font-bold mt-6">Complete seu Cadastro</h1>
            <p className="text-muted-foreground mt-2">
              Precisamos de algumas informações para você participar dos jogos
            </p>
          </div>

          <form
            onSubmit={handleCreateProfile}
            className="space-y-4 bg-gradient-card rounded-xl border border-border/50 p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 bg-secondary border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                className={`h-12 bg-secondary border-border/50 ${cpfError ? 'border-destructive' : ''}`}
                required
              />
              {cpfError && (
                <p className="text-sm text-destructive">{cpfError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cellphone">Celular (opcional)</Label>
              <Input
                id="cellphone"
                type="text"
                placeholder="(00) 00000-0000"
                value={cellphone}
                onChange={(e) => setCellphone(formatPhone(e.target.value))}
                className="h-12 bg-secondary border-border/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading || !!cpfError}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar e Continuar'
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo size="lg" />
          <h1 className="text-2xl font-bold mt-6">
            {mode === 'signin' ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'signin'
              ? 'Entre para confirmar sua presença'
              : 'Cadastre-se para participar dos jogos'}
          </p>
        </div>

        {mode === 'signin' ? (
          <form
            onSubmit={handleSignIn}
            className="space-y-4 bg-gradient-card rounded-xl border border-border/50 p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-secondary border-border/50"
                required
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-primary hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleSignUp}
            className="space-y-4 bg-gradient-card rounded-xl border border-border/50 p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 bg-secondary border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                className={`h-12 bg-secondary border-border/50 ${cpfError ? 'border-destructive' : ''}`}
                required
              />
              {cpfError && (
                <p className="text-sm text-destructive">{cpfError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cellphone">Celular (opcional)</Label>
              <Input
                id="cellphone"
                type="text"
                placeholder="(00) 00000-0000"
                value={cellphone}
                onChange={(e) => setCellphone(formatPhone(e.target.value))}
                className="h-12 bg-secondary border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-secondary border-border/50"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading || !!cpfError}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-primary hover:underline"
              >
                Entrar
              </button>
            </p>
          </form>
        )}

        <button
          onClick={() => navigate(redirectTo)}
          className="flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao evento
        </button>
      </div>
    </div>
  );
};

export default ParticipantAuth;
