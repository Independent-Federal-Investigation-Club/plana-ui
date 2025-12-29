'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { MessageBuilder } from './message-builder';
import { AuthService, LevelsConfig, RoleReward, DiscordMessage } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { TrendingUp, Save, Settings, Plus, X, Award, MessageSquare, Users, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';

interface GuildLevelsTabProps {
  guildId: string;
}

export function GuildLevelsTab({ guildId }: GuildLevelsTabProps) {
  const { guildData } = useGuild();
  const [config, setConfig] = useState<LevelsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const levelsConfig = await AuthService.getLevelsConfig(guildId);
        setConfig(levelsConfig);
      } catch {
        // Initialize with default values if not found
        setConfig({
          id: guildId,
          enabled: false,
          announcement_type: 'current_channel',
          level_up_message: {
            content: 'Congratulations {user.mention}! You reached level {level}!',
            embeds: [
              {
                title: 'Level Up!',
                description: 'You\'ve reached level {level}!',
                color: 7506394
              }
            ]
          },
          xp_per_message: 15,
          xp_cooldown_seconds: 60,
          role_rewards: [],
          xp_boosters: [],
          channel_mode: 'blacklist',
          channel_list: []
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
      const updatedConfig = await AuthService.updateLevelsConfig(guildId, config);
      setConfig(updatedConfig);
      toast.success('Level system settings saved successfully!');
    } catch {
      toast.error('Failed to save level system settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the level system? This will delete all configuration.')) {
      return;
    }

    setSaving(true);
    try {
      await AuthService.deleteLevelsConfig(guildId);
      toast.success('Level system reset successfully!');
      window.location.reload();
    } catch {
      toast.error('Failed to reset level system. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<LevelsConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  const updateLevelUpMessage = (message: DiscordMessage) => {
    updateConfig({ level_up_message: message });
  };

  const addRoleReward = () => {
    if (!config) return;
    const newReward: RoleReward = {
      level: 1,
      role_ids: [],
      remove_previous: false,
      description: ''
    };
    updateConfig({
      role_rewards: [...config.role_rewards, newReward]
    });
  };

  const updateRoleReward = (index: number, reward: RoleReward) => {
    if (!config) return;
    const rewards = [...config.role_rewards];
    rewards[index] = reward;
    updateConfig({ role_rewards: rewards });
  };

  const removeRoleReward = (index: number) => {
    if (!config) return;
    const rewards = [...config.role_rewards];
    rewards.splice(index, 1);
    updateConfig({ role_rewards: rewards });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading level system settings...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load level system settings.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Level System
        </h2>
        <p className="text-muted-foreground">
          Configure XP, leveling, and role rewards for your server
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
            Enable the level system and configure basic XP settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
            <Label>Enable Level System</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>XP per Message</Label>
              <Input
                type="number"
                value={config.xp_per_message}
                onChange={(e) => updateConfig({ xp_per_message: parseInt(e.target.value) || 0 })}
                min="1"
                max="100"
              />
              <p className="text-sm text-muted-foreground">
                Amount of XP gained per message (1-100)
              </p>
            </div>

            <div className="space-y-2">
              <Label>XP Cooldown (seconds)</Label>
              <Input
                type="number"
                value={config.xp_cooldown_seconds}
                onChange={(e) => updateConfig({ xp_cooldown_seconds: parseInt(e.target.value) || 0 })}
                min="0"
                max="300"
              />
              <p className="text-sm text-muted-foreground">
                Minimum time between XP gains (0-300 seconds)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Level Up Announcement</Label>
            <Select 
              value={config.announcement_type} 
              onValueChange={(value: 'current_channel' | 'specific_channel' | 'disabled') => updateConfig({ announcement_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_channel">Current Channel</SelectItem>
                <SelectItem value="specific_channel">Specific Channel</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.announcement_type === 'specific_channel' && (
            <div className="space-y-2">
              <Label>Announcement Channel</Label>
              <ChannelSelect
                channels={guildData?.channels || []}
                categories={guildData?.categories || []}
                value={config.announcement_channel_id || null}
                onValueChange={(value) => updateConfig({ announcement_channel_id: value || undefined })}
                placeholder="Select announcement channel"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Channel Mode</Label>
            <Select 
              value={config.channel_mode} 
              onValueChange={(value: 'whitelist' | 'blacklist') => updateConfig({ channel_mode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blacklist">Blacklist (XP everywhere except selected)</SelectItem>
                <SelectItem value="whitelist">Whitelist (XP only in selected channels)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="message" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="message" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Level Up Message
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Role Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="message">
          <Card>
            <CardHeader>
              <CardTitle>Level Up Message</CardTitle>
              <CardDescription>
                Customize the message sent when a user levels up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBuilder
                message={config.level_up_message || { content: '' }}
                onChange={updateLevelUpMessage}
                placeholder="Congratulations {user.mention}! You reached level {level}! Available variables: {user.mention}, {user.username}, {level}, {server.name}"
                guildId={guildId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Role Rewards
                  </CardTitle>
                  <CardDescription>
                    Configure roles that are automatically assigned when users reach certain levels
                  </CardDescription>
                </div>
                <Button onClick={addRoleReward} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {config.role_rewards.length > 0 ? (
                <div className="space-y-4">
                  {config.role_rewards.map((reward, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Reward {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRoleReward(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Level Required</Label>
                          <Input
                            type="number"
                            value={reward.level}
                            onChange={(e) => updateRoleReward(index, { ...reward, level: parseInt(e.target.value) || 1 })}
                            min="1"
                            max="1000"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <RoleMultiSelect
                            roles={guildData?.roles || []}
                            value={reward.role_ids}
                            onValueChange={(value: string[]) => updateRoleReward(index, { ...reward, role_ids: value })}
                            placeholder="Select role"
                            maxSelection={1}
                            showColors={true}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Input
                            value={reward.description || ''}
                            onChange={(e) => updateRoleReward(index, { ...reward, description: e.target.value })}
                            placeholder="Reward description"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={reward.remove_previous}
                          onCheckedChange={(checked) => updateRoleReward(index, { ...reward, remove_previous: checked })}
                        />
                        <Label className="text-sm">Remove previous level roles</Label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No role rewards configured</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add role rewards to automatically assign roles when users reach certain levels
                  </p>
                  <Button onClick={addRoleReward} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Reward
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="destructive"
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Level System
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Level Settings'}
        </Button>
      </div>
    </div>
  );
} 