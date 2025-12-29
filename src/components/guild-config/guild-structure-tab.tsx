'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGuild } from '@/contexts/guild-context';
import { Folder, Hash,  Users, Crown, Shield } from 'lucide-react';
import { ChannelOverview } from '@/components/plana-ui/channel-overview';

interface GuildStructureTabProps {
  guildId: string;
}

export function GuildStructureTab({ guildId }: GuildStructureTabProps) {
  const { guildData, loading } = useGuild();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!guildData) {
    return (
      <div className="text-center py-8">
        <Folder className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Failed to load server data</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Channels',
      value: guildData.channels.length,
      icon: Hash,
      description: 'Text channels in server'
    },
    {
      title: 'Categories',
      value: guildData.categories.length,
      icon: Folder,
      description: 'Channel categories'
    },
    {
      title: 'Members',
      value: guildData.users.length,
      icon: Users,
      description: 'Server members'
    },
    {
      title: 'Roles',
      value: guildData.roles.length,
      icon: Shield,
      description: 'Server roles'
    }
  ];

  // Calculate some additional stats
  const textChannels = guildData.channels.filter(c => !c.nsfw);
  const nsfwChannels = guildData.channels.filter(c => c.nsfw);
  const channelsWithTopics = guildData.channels.filter(c => c.topic);
  const categoriesWithTopics = guildData.categories.filter(c => c.topic);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Server Structure</h1>
        <p className="text-muted-foreground">
          Overview of {guildData.name}'s channels, categories, and organization
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Channel Analytics
            </CardTitle>
            <CardDescription>
              Breakdown of your server's channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Regular Channels</span>
              <Badge variant="secondary">{textChannels.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">NSFW Channels</span>
              <Badge variant="destructive">{nsfwChannels.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Channels with Topics</span>
              <Badge variant="outline">{channelsWithTopics.length}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-medium">
              <span>Total Channels</span>
              <Badge>{guildData.channels.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Category Analytics
            </CardTitle>
            <CardDescription>
              Organization and structure details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Categories with Descriptions</span>
              <Badge variant="secondary">{categoriesWithTopics.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Uncategorized Channels</span>
              <Badge variant="outline">
                {guildData.channels.filter(c => !c.category_id).length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Channels per Category</span>
              <Badge variant="outline">
                {guildData.categories.length > 0 
                  ? Math.round(guildData.channels.filter(c => c.category_id).length / guildData.categories.length)
                  : 0
                }
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-medium">
              <span>Total Categories</span>
              <Badge>{guildData.categories.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Structure Overview */}
      <ChannelOverview
        channels={guildData.channels}
        categories={guildData.categories}
      />

      {/* Server Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Server Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Server Name</span>
                <p className="text-muted-foreground">{guildData.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Server ID</span>
                <p className="text-muted-foreground font-mono">{guildData.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Owner ID</span>
                <p className="text-muted-foreground font-mono">{guildData.owner_id}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Boost Tier</span>
                <div className="flex items-center gap-2">
                  <Badge variant={guildData.premium_tier > 0 ? "default" : "secondary"}>
                    Tier {guildData.premium_tier}
                  </Badge>
                  {guildData.premium_tier > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({guildData.premium_subscription_count} boosts)
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Total Emojis</span>
                <p className="text-muted-foreground">{guildData.emojis.length}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Total Stickers</span>
                <p className="text-muted-foreground">{guildData.stickers.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 