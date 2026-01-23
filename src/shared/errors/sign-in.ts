export const getErrorMessage = (error: string) => {
  switch (error) {
    case 'Invalid login credentials':
      return 'Email ou senha incorretos';

    case 'Email not confirmed':
      return 'Por favor, confirme seu email antes de entrar';

    case 'Email not found':
      return 'Email não cadastrado';

    case 'Password should be at least 6 characters':
      return 'A senha deve ter pelo menos 6 caracteres';

    case 'Email should be a valid email':
      return 'Email inválido';

    default:
      return 'Erro ao realizar login';
  }
};
