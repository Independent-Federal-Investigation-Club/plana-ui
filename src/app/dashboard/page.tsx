'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AuthService, Guild, getDiscordGuildIconUrl, getDiscordGuildBannerUrl, getBotInviteUrl } from '@/lib/sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Crown, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              {/* Random banner for some cards */}
              {i % 2 === 0 && (
                <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600">
                  <Skeleton className="h-full w-full" />
                </div>
              )}
              <CardHeader className={`pb-3 ${i % 2 === 0 ? 'pt-4' : ''}`}>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-16" />
                      {i % 3 === 0 && <Skeleton className="h-4 w-24" />}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">No Servers Found</h2>
        <p className="text-muted-foreground mb-8">
          You don&apos;t have administrator permissions in any servers, or Project Plana hasn&apos;t been added to your servers yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <a 
              href={getBotInviteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Invite Bot
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

function GuildCard({ guild }: { guild: Guild }) {
  const bannerUrl = getDiscordGuildBannerUrl(guild);
  
  return (
    <Card className={`hover:shadow-lg transition-shadow overflow-hidden ${!guild.bot_installed ? 'opacity-75' : ''}`}>
      {bannerUrl && (
        <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-600">
          <Image
            src={bannerUrl}
            alt={`${guild.name} banner`}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {!guild.bot_installed && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">
                Bot Not Installed
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className={`pb-3 ${bannerUrl ? 'pt-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={getDiscordGuildIconUrl(guild)}
              alt={guild.name}
              width={48}
              height={48}
              className={`rounded-full ${!guild.bot_installed ? 'grayscale' : ''}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-guild-icon.png';
              }}
            />
            {guild.owner && (
              <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{guild.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {guild.owner ? (
                <Badge variant="secondary" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {!guild.bot_installed && !bannerUrl && (
                <Badge variant="destructive" className="text-xs">
                  Bot Not Installed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {guild.bot_installed ? (
          <Button asChild className="w-full">
            <Link href={`/dashboard/${guild.id}`} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage Server
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full" variant="outline">
            <a 
              href={getBotInviteUrl(guild.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Invite Bot
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const userGuilds = await AuthService.getUserGuilds();
        setGuilds(userGuilds);
      } catch {
        setError('Failed to load servers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchGuilds();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-8">
            Please log in with Discord to access your server dashboard.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Server Dashboard</h1>
          <p className="text-muted-foreground">
            Select a server to configure Project Plana settings. You can only manage servers where you have administrator permissions.
          </p>
        </div>

        {guilds.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds.map((guild) => (
              <GuildCard key={guild.id} guild={guild} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 