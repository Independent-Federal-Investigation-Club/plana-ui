'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AuthService, GuildPreferences } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GuildSidebar } from '@/components/guild-config/guild-sidebar';
import { GuildPreferencesTab } from '@/components/guild-config/guild-preferences-tab';
import { GuildWelcomeTab } from '@/components/guild-config/guild-welcome-tab';
import { GuildLevelsTab } from '@/components/guild-config/guild-levels-tab';
import { GuildRssTab } from '@/components/guild-config/guild-rss-tab';
import { GuildReactRolesTab } from '@/components/guild-config/guild-react-roles-tab';
import { GuildMessagesTab } from '@/components/guild-config/guild-messages-tab';
import { GuildAiTab } from '@/components/guild-config/guild-ai-tab';
import { GuildEmojisTab } from '@/components/guild-config/guild-emojis-tab';
import { GuildStructureTab } from '@/components/guild-config/guild-structure-tab';
import { GuildProvider } from '@/contexts/guild-context';

type ActiveTab = 'preferences' | 'welcome' | 'levels' | 'rss' | 'react-roles' | 'messages' | 'emojis' | 'structure' | 'ai';

export default function GuildConfig() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<GuildPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('preferences');

  const guildId = params.guildId as string;

  // Initialize activeTab from URL search params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as ActiveTab;
    if (tabFromUrl && ['preferences', 'welcome', 'levels', 'rss', 'react-roles', 'messages', 'emojis', 'structure', 'ai'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when activeTab changes
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user || !guildId) return;

      try {
        const prefs = await AuthService.getGuildPreferences(guildId);
        setPreferences(prefs);
      } catch {
        setError('Failed to load server preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchPreferences();
    } else if (!authLoading && !user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, guildId, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r bg-muted/20">
          <div className="p-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-8">
            Please log in with Discord to access server settings.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'preferences':
        return <GuildPreferencesTab guildId={guildId} preferences={preferences} setPreferences={setPreferences} />;
      case 'welcome':
        return <GuildWelcomeTab guildId={guildId} />;
      case 'levels':
        return <GuildLevelsTab guildId={guildId} />;
      case 'rss':
        return <GuildRssTab guildId={guildId} />;
      case 'react-roles':
        return <GuildReactRolesTab guildId={guildId} />;
      case 'messages':
        return <GuildMessagesTab guildId={guildId} />;
      case 'emojis':
        return <GuildEmojisTab guildId={guildId} />;
      case 'structure':
        return <GuildStructureTab guildId={guildId} />;
      case 'ai':
        return <GuildAiTab guildId={guildId} />;
      default:
        return <GuildPreferencesTab guildId={guildId} preferences={preferences} setPreferences={setPreferences} />;
    }
  };

  return (
    <GuildProvider guildId={guildId}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <GuildSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          guildId={guildId}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4 px-6 py-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Server Configuration</h1>
                <p className="text-sm text-muted-foreground">
                  Configure Project Plana settings for your server
                </p>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </GuildProvider>
  );
} 