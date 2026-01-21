import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ParticipantProfile {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string;
  cellphone: string | null;
  created_at: string;
  updated_at: string;
}

export function useParticipantProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('participant_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const createProfile = async (fullName: string, cpf: string, cellphone?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('participant_profiles')
        .insert({
          user_id: user.id,
          full_name: fullName,
          cpf: cpf,
          cellphone: cellphone || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        if (error.code === '23505') {
          toast.error('Você já possui um perfil cadastrado');
        } else {
          toast.error('Erro ao criar perfil');
        }
        return false;
      }

      setProfile(data);
      toast.success('Perfil criado com sucesso!');
      return true;
    } catch (err) {
      console.error('Failed to create profile:', err);
      toast.error('Erro ao criar perfil');
      return false;
    }
  };

  const updateProfile = async (fullName: string, cpf: string, cellphone?: string) => {
    if (!user || !profile) {
      toast.error('Perfil não encontrado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('participant_profiles')
        .update({
          full_name: fullName,
          cpf: cpf,
          cellphone: cellphone || null,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Erro ao atualizar perfil');
        return false;
      }

      setProfile(data);
      toast.success('Perfil atualizado com sucesso!');
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Erro ao atualizar perfil');
      return false;
    }
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refetch: fetchProfile,
    hasProfile: !!profile,
  };
}
