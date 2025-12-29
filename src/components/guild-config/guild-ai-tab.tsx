'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthService, AiConfig } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { Save, RotateCcw, Brain, Sparkles, MessageSquare, Shield, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import { ChannelMultiSelect } from '@/components/plana-ui/channel-multi-select';

interface GuildAiTabProps {
  guildId: string;
}

const memoryTypes = [
  { value: '1', label: 'Guild-wide' },
  { value: '2', label: 'Per-category' },
  { value: '3', label: 'Per-channel' },
];

export function GuildAiTab({ guildId }: GuildAiTabProps) {
  const { guildData } = useGuild();
  const roles = guildData?.roles || [];
  const channels = guildData?.channels || [];
  const categories = guildData?.categories || [];
  
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await AuthService.getAiConfig(guildId);
        setConfig(data);
      } catch (error) {
        console.error('Failed to fetch AI config:', error);
        toast.error('Failed to load AI settings');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [guildId]);

  const handleToggle = (field: keyof AiConfig) => {
    if (!config) return;
    setConfig(prev => prev ? ({ ...prev, [field]: !prev[field] }) : null);
  };

  const handleInputChange = (field: keyof AiConfig, value: any) => {
    if (!config) return;
    setConfig(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      await AuthService.updateAiConfig(guildId, config);
      toast.success('AI settings saved successfully!');
    } catch (error) {
      console.error('Failed to save AI config:', error);
      toast.error('Failed to save AI settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset AI settings?')) return;

    setSaving(true);
    try {
      await AuthService.deleteAiConfig(guildId);
      toast.success('AI settings reset successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset AI config:', error);
      toast.error('Failed to reset AI settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Brain className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Loading AI settings...</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Configuration
          </h2>
          <p className="text-muted-foreground">
            Configure how Project Plana interacts with your server using AI
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border">
          <Switch 
            checked={config.enabled} 
            onCheckedChange={() => handleToggle('enabled')} 
          />
          <Label className="text-xs font-semibold uppercase tracking-wider">
            {config.enabled ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personality & Identity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Personality & Identity
            </CardTitle>
            <CardDescription>
              Define who Plana is and how she should talk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea 
                placeholder="You are Plana, a helpful assistant..." 
                className="min-h-[150px] font-mono text-sm"
                value={config.system_prompt || ''}
                onChange={(e) => handleInputChange('system_prompt', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Detailed instructions for the AI on its personality, knowledge, and limitations.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Input Template</Label>
              <Input 
                placeholder={`{user.mention} asks: "{message.content}"`} 
                className="font-mono text-sm"
                value={config.input_template || ''}
                onChange={(e) => handleInputChange('input_template', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                How user messages are formatted before being sent to the AI. Use placeholders like {"{user.mention}"} and {"{message.content}"}.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Behavior & Interaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Behavior & Interaction
            </CardTitle>
            <CardDescription>
              Control how and when the AI engages in conversation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Engagement Mode</Label>
                <p className="text-xs text-muted-foreground">
                  If off, Plana only responds when mentioned. If on, she can join conversations.
                </p>
              </div>
              <Switch 
                checked={config.engage_mode} 
                onCheckedChange={() => handleToggle('engage_mode')} 
              />
            </div>

            {config.engage_mode && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Engagement Rate</Label>
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    {((config.engage_rate || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider 
                  value={[(config.engage_rate || 0) * 100]} 
                  onValueChange={(val) => handleInputChange('engage_rate', val[0] / 100)}
                  max={100} 
                  step={1} 
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Streaming Responses</Label>
                <p className="text-xs text-muted-foreground">
                  Show AI responses as they are being generated.
                </p>
              </div>
              <Switch 
                checked={!!config.stream} 
                onCheckedChange={() => handleToggle('stream')} 
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Reaction Responses</Label>
                <p className="text-xs text-muted-foreground">
                  Allow Plana to use emojis to react to messages.
                </p>
              </div>
              <Switch 
                checked={!!config.reaction_responses} 
                onCheckedChange={() => handleToggle('reaction_responses')} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Memory Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Memory & Context
            </CardTitle>
            <CardDescription>
              Configure how much information the AI remembers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Memory Scope</Label>
              <Select 
                value={(config.memory_type || 1).toString()} 
                onValueChange={(val) => handleInputChange('memory_type', parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select memory scope" />
                </SelectTrigger>
                <SelectContent>
                  {memoryTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Defines how the AI groups conversation history.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label>Memory Limit</Label>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {config.memory_limit || 50} messages
                </span>
              </div>
              <Slider 
                value={[config.memory_limit || 50]} 
                onValueChange={(val) => handleInputChange('memory_limit', val[0])}
                max={100} 
                min={5}
                step={1} 
              />
              <p className="text-xs text-muted-foreground">
                The number of previous messages to include in the context.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Targeting & Scope */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Targeting & Scope
            </CardTitle>
            <CardDescription>
              Restrict which roles and channels the AI can interact with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Roles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Role Restrictions</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {config.target_roles_mode ? 'Whitelist' : 'Blacklist'}
                    </span>
                    <Switch 
                      checked={!!config.target_roles_mode} 
                      onCheckedChange={() => handleToggle('target_roles_mode')} 
                    />
                  </div>
                </div>
                <RoleMultiSelect 
                  roles={roles}
                  value={config.target_roles || []}
                  onValueChange={(val) => handleInputChange('target_roles', val)}
                  placeholder={config.target_roles_mode ? "Only these roles..." : "Ignore these roles..."}
                />
              </div>

              {/* Channels */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Channel Restrictions</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {config.target_channels_mode ? 'Whitelist' : 'Blacklist'}
                    </span>
                    <Switch 
                      checked={!!config.target_channels_mode} 
                      onCheckedChange={() => handleToggle('target_channels_mode')} 
                    />
                  </div>
                </div>
                <ChannelMultiSelect 
                  channels={channels}
                  categories={categories}
                  value={config.target_channels || []}
                  onValueChange={(val) => handleInputChange('target_channels', val)}
                  placeholder={config.target_channels_mode ? "Only these channels..." : "Ignore these channels..."}
                />
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  AI-Assisted Moderation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow the AI to help monitor chat and flag inappropriate content.
                </p>
              </div>
              <Switch 
                checked={!!config.ai_moderation} 
                onCheckedChange={() => handleToggle('ai_moderation')} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="destructive"
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !config.enabled}
          className="flex items-center gap-2 px-8"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save AI Settings'}
        </Button>
      </div>
    </div>
  );
}
