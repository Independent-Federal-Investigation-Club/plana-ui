'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, GuildData } from '@/lib/sdk';

interface GuildContextType {
  guildData: GuildData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

interface GuildProviderProps {
  children: ReactNode;
  guildId: string;
}

export function GuildProvider({ children, guildId }: GuildProviderProps) {
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuildData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AuthService.getGuildData(guildId);
      setGuildData(data);
    } catch (err) {
      setError('Failed to load guild data');
      console.error('Failed to fetch guild data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuildData();
  }, [guildId]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    guildData,
    loading,
    error,
    refetch: fetchGuildData
  };

  return (
    <GuildContext.Provider value={value}>
      {children}
    </GuildContext.Provider>
  );
}

export function useGuild() {
  const context = useContext(GuildContext);
  if (context === undefined) {
    throw new Error('useGuild must be used within a GuildProvider');
  }
  return context;
} 