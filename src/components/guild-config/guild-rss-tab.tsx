'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { AuthService, RssFeed } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { Rss, Save, X, Globe, Hash, Settings, Calendar, Power, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ChannelSelect } from '@/components/plana-ui/channel-select';

interface GuildRssTabProps {
  guildId: string;
}

export function GuildRssTab({ guildId }: GuildRssTabProps) {
  const { guildData } = useGuild();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchFeeds();
  }, [guildId]);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const response = await AuthService.getRssFeeds(guildId);
      setFeeds(response.data);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error('Failed to fetch RSS feeds:', error);
      toast.error('Failed to load RSS feeds');
    } finally {
      setLoading(false);
    }
  };

  const addFeed = async () => {
    const newFeed = {
      channel_id: null,
      guild_id: guildId,
      url: '',
      name: 'New RSS Feed',
      enabled: true,
      message: 'New article: {title}'
    };
    
    try {
      const createdFeed = await AuthService.createRssFeed(guildId, newFeed);
      setFeeds(prev => [...prev, createdFeed]);
      setTotalCount(prev => prev + 1);
      toast.success('RSS feed created successfully!');
    } catch (error) {
      console.error('Failed to create RSS feed:', error);
      toast.error('Failed to create RSS feed');
    }
  };

  const updateFeed = async (feedId: string, updatedFeed: RssFeed) => {
    if (!feedId) return;
    
    // Validate that feed cannot be enabled without a channel
    if (updatedFeed.enabled && !updatedFeed.channel_id) {
      toast.error('Cannot enable feed without selecting a channel');
      return;
    }
    
    try {
      setSaving(feedId);
      const updated = await AuthService.updateRssFeed(guildId, feedId, {
        ...updatedFeed,
      });
      setFeeds(prev => prev.map(feed => feed.id === feedId ? updated : feed));
      toast.success('RSS feed updated successfully!');
    } catch (error) {
      console.error('Failed to update RSS feed:', error);
      toast.error('Failed to update RSS feed');
    } finally {
      setSaving(null);
    }
  };

  const removeFeed = async (feedId: string) => {
    if (!feedId || !confirm('Are you sure you want to delete this RSS feed?')) return;
    
    try {
      await AuthService.deleteRssFeed(guildId, feedId);
      setFeeds(prev => prev.filter(feed => feed.id !== feedId));
      setTotalCount(prev => prev - 1);
      toast.success('RSS feed deleted successfully!');
    } catch (error) {
      console.error('Failed to delete RSS feed:', error);
      toast.error('Failed to delete RSS feed');
    }
  };

  const toggleFeedStatus = async (feedId: string, enabled: boolean) => {
    const feed = feeds.find(f => f.id === feedId);
    if (!feed) return;
    
    // Prevent enabling feed without channel
    if (enabled && !feed.channel_id) {
      toast.error('Cannot enable feed without selecting a channel');
      return;
    }
    
    await updateFeed(feedId, { ...feed, enabled });
  };

  const feedItems: ItemListItem[] = feeds.map((feed) => ({
    id: feed.id || 'temp',
    title: feed.name,
    subtitle: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{feed.url}</span>
        {feed.last_updated && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Last updated: {new Date(feed.last_updated).toLocaleString()}</span>
          </div>
        )}
      </div>
    ),
    status: feed.enabled ? 'Active' : 'Disabled',
    statusVariant: feed.enabled ? 'default' : 'secondary',
    actions: [
      {
        label: feed.enabled ? 'Disable' : 'Enable',
        onClick: () => toggleFeedStatus(feed.id!, !feed.enabled),
        variant: feed.enabled ? 'outline' as const : (!feed.channel_id ? 'secondary' as const : 'default' as const),
        icon: Power,
        disabled: !feed.enabled && !feed.channel_id
      },
      {
        label: 'Delete',
        onClick: () => removeFeed(feed.id!),
        variant: 'destructive' as const,
        icon: X
      }
    ],
    content: (
      <FeedForm
        feed={feed}
        onChange={(updatedFeed) => updateFeed(feed.id!, updatedFeed)}
        guildData={guildData}
        saving={saving === feed.id}
      />
    )
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Rss className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">RSS Feeds</h2>
              <p className="text-sm text-muted-foreground">
                Manage RSS feeds to automatically post new articles to your server channels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchFeeds} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Rss className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Feeds</span>
            </div>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Power className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active Feeds</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {feeds.filter(feed => feed.enabled).length}
            </p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Power className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Disabled Feeds</span>
            </div>
            <p className="text-2xl font-bold text-muted-foreground">
              {feeds.filter(feed => !feed.enabled).length}
            </p>
          </div>
        </div>
      </div>

      {/* RSS Feeds List */}
      <ItemList
        title="RSS Feeds"
        description="Configure individual RSS feeds with custom settings for each channel"
        icon={Rss}
        items={feedItems}
        onAddItem={addFeed}
        addItemLabel="Add RSS Feed"
        loading={loading}
        emptyMessage="No RSS feeds configured yet"
        emptyDescription="Get started by adding your first RSS feed to begin receiving automatic updates"
        showSaveAll={false}
      />
    </div>
  );
}

interface FeedFormProps {
  feed: RssFeed;
  onChange: (feed: RssFeed) => void;
  guildData: any;
  saving?: boolean;
}

function FeedForm({ feed, onChange, guildData, saving }: FeedFormProps) {
  const [localFeed, setLocalFeed] = useState(feed);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalFeed(feed);
    setHasChanges(false);
  }, [feed]);

  const updateField = (field: keyof RssFeed, value: any) => {
    const updated = { ...localFeed, [field]: value };
    
    // Auto-disable feed if channel is removed
    if (field === 'channel_id' && !value && updated.enabled) {
      updated.enabled = false;
      toast.info('Feed automatically disabled - no channel selected');
    }
    
    setLocalFeed(updated);
    setHasChanges(true);
  };

  const saveChanges = () => {
    // Validate before saving
    if (localFeed.enabled && !localFeed.channel_id) {
      toast.error('Cannot enable feed without selecting a channel');
      return;
    }
    
    onChange(localFeed);
    setHasChanges(false);
  };

  const resetChanges = () => {
    setLocalFeed(feed);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Feed Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h4 className="font-medium">Feed Configuration</h4>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button onClick={resetChanges} variant="outline" size="sm">
                Reset
              </Button>
              <Button onClick={saveChanges} size="sm" disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Feed Name</Label>
            <Input
              value={localFeed.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Tech News, Company Blog"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              A friendly name to identify this feed
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Target Channel
              {localFeed.enabled && !localFeed.channel_id && (
                <span className="text-xs text-red-500">(Required for enabled feeds)</span>
              )}
            </Label>
            <ChannelSelect
              channels={guildData?.channels || []}
              categories={guildData?.categories || []}
              value={localFeed.channel_id}
              onValueChange={(value) => updateField('channel_id', value || null)}
              placeholder="Select channel"
            />
            <p className="text-xs text-muted-foreground">
              Channel where new articles will be posted
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" />
            RSS Feed URL
          </Label>
          <Input
            value={localFeed.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="https://example.com/feed.xml"
            type="url"
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            The URL of the RSS/Atom feed to monitor
          </p>
        </div>

        {/* Feed Status Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Feed Status</Label>
            <p className="text-xs text-muted-foreground">
              {localFeed.enabled 
                ? 'This feed is active and will post new articles'
                : 'This feed is disabled and will not post articles'
              }
            </p>
            {!localFeed.channel_id && (
              <p className="text-xs text-red-500 mt-1">
                A channel must be selected to enable this feed
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={localFeed.enabled}
              onCheckedChange={(enabled) => {
                if (enabled && !localFeed.channel_id) {
                  toast.error('Please select a channel first');
                  return;
                }
                updateField('enabled', enabled);
              }}
              disabled={!localFeed.channel_id}
            />
            <Label className="text-sm">
              {localFeed.enabled ? 'Active' : 'Disabled'}
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Message Template */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Rss className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-medium">Message Template</h4>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <textarea
              className="w-full min-h-[120px] p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              value={localFeed.message}
              onChange={(e) => updateField('message', e.target.value)}
              placeholder="New article: {title}&#10;{description}&#10;&#10;Read more: {link}"
            />
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Available Variables:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <code className="bg-background px-2 py-1 rounded text-primary">{'{title}'}</code>
              <code className="bg-background px-2 py-1 rounded text-primary">{'{description}'}</code>
              <code className="bg-background px-2 py-1 rounded text-primary">{'{link}'}</code>
              <code className="bg-background px-2 py-1 rounded text-primary">{'{author}'}</code>
              <code className="bg-background px-2 py-1 rounded text-primary">{'{pubDate}'}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 