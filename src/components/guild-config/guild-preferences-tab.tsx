'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthService, GuildPreferences } from '@/lib/sdk';
import { Save, RotateCcw, Settings, Palette, Globe, Plus, X, Image, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { ImageUploadModal } from '@/components/plana-ui/image-upload-modal';

interface FormData {
  command_prefix: string;
  language: string;
  timezone: string;
  embed_color: string;
  embed_footer: string;
  embed_footer_images: string[];
}

const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'zh-TW', label: 'Chinese (Traditional)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

interface GuildPreferencesTabProps {
  guildId: string;
  preferences: GuildPreferences | null;
  setPreferences: (preferences: GuildPreferences) => void;
}

export function GuildPreferencesTab({ guildId, preferences, setPreferences }: GuildPreferencesTabProps) {
  const [formData, setFormData] = useState<FormData>({
    command_prefix: preferences?.command_prefix || '!',
    language: preferences?.language || 'en-US',
    timezone: preferences?.timezone || 'UTC',
    embed_color: preferences?.embed_color || '#7289DA',
    embed_footer: preferences?.embed_footer || 'Project Plana, Powered by S.C.H.A.L.E.',
    embed_footer_images: preferences?.embed_footer_images || [],
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFooterImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      embed_footer_images: [...prev.embed_footer_images, url]
    }));
  };

  const removeFooterImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      embed_footer_images: prev.embed_footer_images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const updateData = {
        command_prefix: formData.command_prefix,
        language: formData.language,
        timezone: formData.timezone,
        embed_color: formData.embed_color,
        embed_footer: formData.embed_footer,
        embed_footer_images: formData.embed_footer_images,
      };

      const updatedPrefs = await AuthService.updateGuildPreferences(guildId, updateData);
      setPreferences(updatedPrefs);
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await AuthService.resetGuildPreferences(guildId);
      toast.success('Settings reset to defaults successfully!');
      window.location.reload();
    } catch {
      toast.error('Failed to reset settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          General Settings
        </h2>
        <p className="text-muted-foreground">
          Configure basic bot behavior and appearance settings
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bot Configuration
          </CardTitle>
          <CardDescription>
            Configure basic bot behavior and command settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="command_prefix">Command Prefix</Label>
            <Input
              id="command_prefix"
              value={formData.command_prefix}
              onChange={(e) => handleInputChange('command_prefix', e.target.value)}
              placeholder="!"
              maxLength={5}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              The prefix used before bot commands (e.g., !help)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Embed Appearance
          </CardTitle>
          <CardDescription>
            Customize how bot messages and embeds appear
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embed_color">Embed Color</Label>
            <div className="flex gap-2 max-w-md">
              <Input
                type="color"
                value={formData.embed_color}
                onChange={(e) => handleInputChange('embed_color', e.target.value)}
                className="w-16 h-9 p-1"
              />
              <Input
                placeholder="#7289DA"
                value={formData.embed_color}
                onChange={(e) => handleInputChange('embed_color', e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The color used for bot embed messages
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="embed_footer">Embed Footer</Label>
            <Input
              id="embed_footer"
              value={formData.embed_footer}
              onChange={(e) => handleInputChange('embed_footer', e.target.value)}
              placeholder="Project Plana, Powered by S.C.H.A.L.E."
              maxLength={100}
              className="max-w-1/2"
            />
            <p className="text-sm text-muted-foreground">
              Text displayed at the bottom of bot embeds
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Embed Footer Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Footer Images
          </CardTitle>
          <CardDescription>
            Upload images to randomly display in embed footers. You can add multiple images for variety.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Add New Footer Image</Label>
              <div className="text-sm text-muted-foreground">
                {formData.embed_footer_images.length} image{formData.embed_footer_images.length !== 1 ? 's' : ''} uploaded
              </div>
            </div>
            <ImageUploadModal
              value=""
              onValueChange={(url) => {
                if (url) {
                  addFooterImage(url);
                }
              }}
              guildId={guildId}
              title="Add Footer Image"
              trigger={
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Footer Image
                </Button>
              }
            />
            <p className="text-sm text-muted-foreground">
              Upload or enter image URL for embed footer. Recommended size: 20x20 to 64x64 pixels for footer icons.
            </p>
          </div>
          
          {/* Image Gallery */}
          {formData.embed_footer_images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Footer Image Gallery</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to remove all footer images?')) {
                      setFormData(prev => ({ ...prev, embed_footer_images: [] }));
                    }
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {formData.embed_footer_images.map((imageUrl, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-transparent group-hover:border-primary/50 overflow-hidden transition-colors">
                      <img
                        src={imageUrl}
                        alt={`Footer image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDMuNUgzQzIuNzIgMy41IDIuNSAzLjcyIDIuNSA0VjIwQzIuNSAyMC4yOCAyLjcyIDIwLjUgMyAyMC41SDIxQzIxLjI4IDIwLjUgMjEuNSAyMC4yOCAyMS41IDIwVjRDMjEuNSAzLjcyIDIxLjI4IDMuNSAyMSAzLjVaTTIwIDEzLjVMMTYuNSAxMEwxMy4wMSAxMy40OUw5LjUgOS45OUw0IDEzVjVIMjBWMTMuNVoiIGZpbGw9IiM5ZjlmOWYiLz4KPC9zdmc+';
                        }}
                      />
                    </div>
                    
                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        {/* Preview/View Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(imageUrl, '_blank')}
                          title="View full image"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this footer image?')) {
                              removeFooterImage(index);
                            }
                          }}
                          title="Delete image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image index indicator */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {/* Add more button */}
                <ImageUploadModal
                  value=""
                  onValueChange={(url) => {
                    if (url) {
                      addFooterImage(url);
                    }
                  }}
                  guildId={guildId}
                  title="Add Another Footer Image"
                  trigger={
                    <div className="aspect-square bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors group">
                      <div className="text-center">
                        <Plus className="h-6 w-6 mx-auto mb-1 text-muted-foreground group-hover:text-primary" />
                        <p className="text-xs text-muted-foreground group-hover:text-primary">Add Image</p>
                      </div>
                    </div>
                  }
                />
              </div>
              
              {/* Image URLs List (for reference/debugging) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Image URLs</Label>
                <div className="space-y-1">
                  {formData.embed_footer_images.map((imageUrl, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                      <span className="font-mono text-muted-foreground min-w-0 flex-1 truncate">
                        {index + 1}. {imageUrl}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(imageUrl);
                          toast.success('Image URL copied to clipboard');
                        }}
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {formData.embed_footer_images.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No footer images</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add footer images to randomly display in your bot's embed footers
              </p>
              <ImageUploadModal
                value=""
                onValueChange={(url) => {
                  if (url) {
                    addFooterImage(url);
                  }
                }}
                guildId={guildId}
                title="Add Your First Footer Image"
                trigger={
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Image
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Set language and timezone preferences for your server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The language for bot responses and messages
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Timezone for scheduling and time-based features
            </p>
          </div>
        </CardContent>
      </Card>

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
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 