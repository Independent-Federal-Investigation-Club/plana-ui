'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageBuilder } from './message-builder';
import { AuthService, WelcomeConfig, DiscordMessage } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { Users, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';

interface GuildWelcomeTabProps {
  guildId: string;
}

export function GuildWelcomeTab({ guildId }: GuildWelcomeTabProps) {
  const { guildData } = useGuild();
  const [config, setConfig] = useState<WelcomeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const welcomeConfig = await AuthService.getWelcomeConfig(guildId);
        setConfig(welcomeConfig);
      } catch {
        // Initialize with default values if not found
        setConfig({
          id: guildId,
          enabled: false,
          dm_new_users: false,
          welcome_message: {
            content: 'Welcome {user.mention} to the server!',
            embeds: [
              {
                title: 'Welcome!',
                description: 'Thanks for joining our server!',
                color: 7506394
              }
            ]
          },
          goodbye_message: {
            content: 'Goodbye {user.mention}!'
          },
          dm_message: {
            content: 'Welcome to our Discord server!'
          },
          auto_roles: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [guildId]);

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const updatedConfig = await AuthService.updateWelcomeConfig(guildId, config);
      setConfig(updatedConfig);
      toast.success('Welcome settings saved successfully!');
    } catch {
      toast.error('Failed to save welcome settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<WelcomeConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  const updateWelcomeMessage = (message: DiscordMessage) => {
    updateConfig({ welcome_message: message });
  };

  const updateGoodbyeMessage = (message: DiscordMessage) => {
    updateConfig({ goodbye_message: message });
  };

  const updateDmMessage = (message: DiscordMessage) => {
    updateConfig({ dm_message: message });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading welcome settings...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load welcome settings.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Welcome System
        </h2>
        <p className="text-muted-foreground">
          Configure welcome and goodbye messages for new members
        </p>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Enable the welcome system and configure basic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
            <Label>Enable Welcome System</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Welcome Channel</Label>
              <ChannelSelect
                channels={guildData?.channels || []}
                categories={guildData?.categories || []}
                value={config.welcome_channel_id || null}
                onValueChange={(value) => updateConfig({ welcome_channel_id: value || undefined })}
                placeholder="Select welcome channel"
              />
            </div>

            <div className="space-y-2">
              <Label>Goodbye Channel</Label>
              <ChannelSelect
                channels={guildData?.channels || []}
                categories={guildData?.categories || []}
                value={config.goodbye_channel_id || null}
                onValueChange={(value) => updateConfig({ goodbye_channel_id: value || undefined })}
                placeholder="Select goodbye channel"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.dm_new_users}
              onCheckedChange={(dm_new_users) => updateConfig({ dm_new_users })}
            />
            <Label>Send DM to new users</Label>
          </div>

          <div className="space-y-2">
            <Label>Auto Roles</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Roles automatically assigned to new members
            </p>
            <RoleMultiSelect
              roles={guildData?.roles || []}
              value={config.auto_roles || []}
              onValueChange={(value) => updateConfig({ auto_roles: value })}
              placeholder="Select roles to assign automatically"
            />
          </div>
        </CardContent>
      </Card>

      {/* Message Configuration */}
      <Tabs defaultValue="welcome" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="welcome">Welcome Message</TabsTrigger>
          <TabsTrigger value="goodbye">Goodbye Message</TabsTrigger>
          <TabsTrigger value="dm">DM Message</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Message</CardTitle>
              <CardDescription>
                Message sent when a new member joins the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBuilder
                message={config.welcome_message || { content: '' }}
                onChange={updateWelcomeMessage}
                placeholder="Welcome {user.mention} to our server! Available variables: {user.mention}, {user.username}, {server.name}, {server.member_count}"
                guildId={guildId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goodbye">
          <Card>
            <CardHeader>
              <CardTitle>Goodbye Message</CardTitle>
              <CardDescription>
                Message sent when a member leaves the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBuilder
                message={config.goodbye_message || { content: '' }}
                onChange={updateGoodbyeMessage}
                placeholder="Goodbye {user.username}! Available variables: {user.username}, {server.name}, {server.member_count}"
                guildId={guildId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dm">
          <Card>
            <CardHeader>
              <CardTitle>DM Message</CardTitle>
              <CardDescription>
                Private message sent directly to new members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBuilder
                message={config.dm_message || { content: '' }}
                onChange={updateDmMessage}
                placeholder="Welcome to {server.name}! Available variables: {user.username}, {server.name}"
                guildId={guildId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Welcome Settings'}
        </Button>
      </div>
    </div>
  );
} 