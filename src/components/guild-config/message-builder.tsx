'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageEmbed, DiscordMessage } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { ImageUploadModal } from '@/components/plana-ui/image-upload-modal';
import { 
  Plus, 
  X, 
  Hash, 
  Palette, 
  User, 
  AtSign,
  Eye,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface MessageBuilderProps {
  message: DiscordMessage;
  onChange: (message: DiscordMessage) => void;
  placeholder?: string;
  showPreview?: boolean;
  guildId: string;
}

interface AutocompleteOption {
  type: 'user' | 'role' | 'channel' | 'emoji';
  id: string;
  name: string;
  display: string;
  avatar?: string;
  color?: number;
  animated?: boolean;
}

export function MessageBuilder({ 
  message, 
  onChange, 
  placeholder = "Type your message...",
  showPreview = true,
  guildId
}: MessageBuilderProps) {
  const { guildData } = useGuild();
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<AutocompleteOption[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeTextarea, setActiveTextarea] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // Utility functions
  const hexToDecimal = (hex: string): number => {
    return parseInt(hex.replace('#', ''), 16);
  };

  const decimalToHex = (decimal: number): string => {
    return '#' + decimal.toString(16).padStart(6, '0');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Autocomplete logic
  const getAutocompleteOptions = useCallback((query: string, type: string): AutocompleteOption[] => {
    if (!guildData) return [];

    const normalizedQuery = query.toLowerCase();
    let options: AutocompleteOption[] = [];

    switch (type) {
      case '@':
        const users = guildData.users
          .filter(user => user.username.toLowerCase().includes(normalizedQuery))
          .slice(0, 5)
          .map(user => ({
            type: 'user' as const,
            id: user.user_id,
            name: user.username,
            display: `@${user.username}`,
            avatar: user.avatar
          }));

        const roles = guildData.roles
          .filter(role => role.name.toLowerCase().includes(normalizedQuery))
          .slice(0, 5)
          .map(role => ({
            type: 'role' as const,
            id: role.role_id,
            name: role.name,
            display: `@${role.name}`,
            color: role.color
          }));

        options = [...users, ...roles];
        break;

      case '#':
        options = guildData.channels
          .filter(channel => channel.name.toLowerCase().includes(normalizedQuery))
          .slice(0, 8)
          .map(channel => ({
            type: 'channel' as const,
            id: channel.channel_id,
            name: channel.name,
            display: `#${channel.name}`
          }));
        break;

      case ':':
        options = guildData.emojis
          .filter(emoji => emoji.name.toLowerCase().includes(normalizedQuery))
          .slice(0, 8)
          .map(emoji => ({
            type: 'emoji' as const,
            id: emoji.emoji_id || emoji.name,
            name: emoji.name, 
            display: `:${emoji.name}:`,
            animated: emoji.animated
          }));
        break;
    }

    return options;
  }, [guildData]);

  const handleTextChange = (value: string, textareaId: string = 'main') => {
    // Update the message based on textarea type
    if (textareaId === 'main') {
      onChange({ ...message, content: value });
    } else if (textareaId.startsWith('description-')) {
      const embedIndex = parseInt(textareaId.split('-')[1]);
      const embeds = [...(message.embeds || [])];
      embeds[embedIndex] = { ...embeds[embedIndex], description: value };
      onChange({ ...message, embeds });
    } else if (textareaId.startsWith('field-')) {
      const [, embedIndex, fieldIndex] = textareaId.split('-').map(Number);
      const embeds = [...(message.embeds || [])];
      embeds[embedIndex].fields![fieldIndex] = { 
        ...embeds[embedIndex].fields![fieldIndex], 
        value 
      };
      onChange({ ...message, embeds });
    }

    // Check for autocomplete triggers
    const textarea = textareaId === 'main' ? textareaRef.current : textareaRefs.current[textareaId];
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastChar = textBeforeCursor[textBeforeCursor.length - 1];
    
    if (['@', '#', ':'].includes(lastChar)) {
      const match = textBeforeCursor.match(/[@#:](\w*)$/);
      if (match) {
        const query = match[1];
        const options = getAutocompleteOptions(query, lastChar);
        setAutocompleteOptions(options);
        setShowAutocomplete(options.length > 0);
        setCursorPosition(cursorPos);
        setActiveTextarea(textareaId);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const insertAutocomplete = (option: AutocompleteOption) => {
    const textarea = activeTextarea === 'main' ? textareaRef.current : textareaRefs.current[activeTextarea];
    if (!textarea) return;

    let content = '';
    if (activeTextarea === 'main') {
      content = message.content || '';
    } else if (activeTextarea.startsWith('description-')) {
      const embedIndex = parseInt(activeTextarea.split('-')[1]);
      content = message.embeds?.[embedIndex]?.description || '';
    } else if (activeTextarea.startsWith('field-')) {
      const [, embedIndex, fieldIndex] = activeTextarea.split('-').map(Number);
      content = message.embeds?.[embedIndex]?.fields?.[fieldIndex]?.value || '';
    }

    const beforeCursor = content.slice(0, cursorPosition);
    const afterCursor = content.slice(cursorPosition);
    
    const triggerMatch = beforeCursor.match(/[@#:](\w*)$/);
    if (!triggerMatch) return;

    const triggerStart = beforeCursor.length - triggerMatch[0].length;
    let replacement = '';

    switch (option.type) {
      case 'user':
        replacement = `<@${option.id}>`;
        break;
      case 'role':
        replacement = `<@&${option.id}>`;
        break;
      case 'channel':
        replacement = `<#${option.id}>`;
        break;
      case 'emoji':
        replacement = option.animated 
          ? `<a:${option.name}:${option.id}>` 
          : `<:${option.name}:${option.id}>`;
        break;
    }

    const newContent = content.slice(0, triggerStart) + replacement + afterCursor;
    handleTextChange(newContent, activeTextarea);
    setShowAutocomplete(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        triggerStart + replacement.length,
        triggerStart + replacement.length
      );
    }, 0);
  };

  // Embed management
  const addEmbed = () => {
    const newEmbed: MessageEmbed = {
      title: '',
      description: '',
      color: 7506394,
      fields: []
    };
    onChange({
      ...message,
      embeds: [...(message.embeds || []), newEmbed]
    });
  };

  const updateEmbed = (index: number, embed: MessageEmbed) => {
    const embeds = [...(message.embeds || [])];
    embeds[index] = embed;
    onChange({ ...message, embeds });
  };

  const removeEmbed = (index: number) => {
    const embeds = [...(message.embeds || [])];
    embeds.splice(index, 1);
    onChange({ ...message, embeds });
  };

  const addEmbedField = (embedIndex: number) => {
    const embeds = [...(message.embeds || [])];
    embeds[embedIndex].fields = [
      ...(embeds[embedIndex].fields || []),
      { name: '', value: '', inline: false }
    ];
    onChange({ ...message, embeds });
  };

  const updateEmbedField = (embedIndex: number, fieldIndex: number, field: { name: string; value: string; inline: boolean }) => {
    const embeds = [...(message.embeds || [])];
    embeds[embedIndex].fields![fieldIndex] = field;
    onChange({ ...message, embeds });
  };

  const removeEmbedField = (embedIndex: number, fieldIndex: number) => {
    const embeds = [...(message.embeds || [])];
    embeds[embedIndex].fields!.splice(fieldIndex, 1);
    onChange({ ...message, embeds });
  };

  // Render Discord-style content with mentions/emojis
  const renderDiscordContent = (content: string) => {
    if (!content) return null;
    
    return content.split('\n').map((line, lineIndex) => {
      const parts = line.split(/(<[@#:][\w&:]+>|:\w+:)/g);
      
      return (
        <div key={lineIndex}>
          {parts.map((part, partIndex) => {
            // User mention
            if (part.match(/^<@(\d+)>$/)) {
              const userId = part.match(/^<@(\d+)>$/)![1];
              const user = guildData?.users.find(u => u.user_id === userId);
              return (
                <span key={partIndex} className="bg-blue-500/20 text-blue-400 px-1 rounded text-sm">
                  @{user?.username || 'Unknown User'}
                </span>
              );
            }
            
            // Role mention
            if (part.match(/^<@&(\d+)>$/)) {
              const roleId = part.match(/^<@&(\d+)>$/)![1];
              const role = guildData?.roles.find(r => r.role_id === roleId);
              return (
                <span 
                  key={partIndex} 
                  className="px-1 rounded text-sm"
                  style={{ 
                    backgroundColor: role?.color ? `${decimalToHex(role.color)}20` : '#7289DA20',
                    color: role?.color ? decimalToHex(role.color) : '#7289DA'
                  }}
                >
                  @{role?.name || 'Unknown Role'}
                </span>
              );
            }
            
            // Channel mention
            if (part.match(/^<#(\d+)>$/)) {
              const channelId = part.match(/^<#(\d+)>$/)![1];
              const channel = guildData?.channels.find(c => c.channel_id === channelId);
              return (
                <span key={partIndex} className="bg-muted text-muted-foreground px-1 rounded text-sm">
                  #{channel?.name || 'Unknown Channel'}
                </span>
              );
            }
            
            // Custom emoji
            if (part.match(/^<a?:\w+:\d+>$/)) {
              const match = part.match(/^<(a?):(\w+):(\d+)>$/);
              if (match) {
                const [, animated, name, id] = match;
                return (
                  <img 
                    key={partIndex}
                    src={`https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`}
                    alt={`:${name}:`}
                    className="inline w-5 h-5 mx-1"
                  />
                );
              }
            }
            
            return part;
          })}
          {lineIndex < content.split('\n').length - 1 && <br />}
        </div>
      );
    });
  };

  // Render autocomplete dropdown
  const renderAutocompleteDropdown = () => {
    if (!showAutocomplete || autocompleteOptions.length === 0) return null;

    return (
      <div className="absolute z-50 mt-1 w-72 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
        {autocompleteOptions.map((option) => (
          <button
            key={`${option.type}-${option.id}`}
            className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
            onClick={() => insertAutocomplete(option)}
          >
            {option.type === 'user' && (
              <>
                {option.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${option.id}/${option.avatar}.png`}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-3 w-3" />
                  </div>
                )}
                <span className="font-medium">{option.display}</span>
              </>
            )}
            
            {option.type === 'role' && (
              <>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: option.color ? decimalToHex(option.color) : '#7289DA' }}
                />
                <span className="font-medium">{option.display}</span>
              </>
            )}
            
            {option.type === 'channel' && (
              <>
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{option.display}</span>
              </>
            )}
            
            {option.type === 'emoji' && (
              <>
                <img 
                  src={`https://cdn.discordapp.com/emojis/${option.id}.${option.animated ? 'gif' : 'png'}`}
                  alt={option.name}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">{option.display}</div>
                  {option.animated && (
                    <Badge variant="secondary" className="text-xs">Animated</Badge>
                  )}
                </div>
              </>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Render Discord-style preview
  const renderDiscordPreview = () => {
    if (!message.content && (!message.embeds || message.embeds.length === 0)) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Your message preview will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Message Content */}
        {message.content && (
          <div className="text-sm leading-relaxed">
            {renderDiscordContent(message.content)}
          </div>
        )}

        {/* Embeds */}
        {message.embeds?.map((embed, index) => (
          <div 
            key={index} 
            className="border-l-4 pl-3 py-2 bg-muted/20 rounded-r relative"
            style={{ borderLeftColor: embed.color ? decimalToHex(embed.color) : '#7289DA' }}
          >
            <div className="space-y-2">
              {/* Thumbnail - positioned top right */}
              {embed.thumbnail && (
                <div className="absolute top-2 right-2">
                  <img 
                    src={embed.thumbnail} 
                    alt=""
                    className="max-w-20 max-h-20 rounded object-cover"
                  />
                </div>
              )}

              {/* Author */}
              {embed.author && (
                <div className="flex items-center gap-2 mb-2">
                  {embed.author.icon_url && (
                    <img 
                      src={embed.author.icon_url} 
                      alt=""
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {embed.author.url ? (
                      <a href={embed.author.url} className="text-blue-500 hover:underline">
                        {embed.author.name}
                      </a>
                    ) : (
                      embed.author.name
                    )}
                  </span>
                </div>
              )}

              {/* Title */}
              {embed.title && (
                <div className="font-semibold text-primary mb-1 pr-24">
                  {embed.url ? (
                    <a href={embed.url} className="hover:underline">
                      {embed.title}
                    </a>
                  ) : (
                    embed.title
                  )}
                </div>
              )}

              {/* Description */}
              {embed.description && (
                <div className="text-sm mb-3 leading-relaxed pr-24">
                  {renderDiscordContent(embed.description)}
                </div>
              )}

              {/* Fields */}
              {embed.fields && embed.fields.length > 0 && (
                <div className={`grid gap-2 mb-3 ${
                  embed.fields.some(f => f.inline) ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'
                }`}>
                  {embed.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className={field.inline ? 'md:col-span-1' : 'md:col-span-3'}>
                      <div className="font-semibold text-sm mb-1">{field.name}</div>
                      <div className="text-sm leading-relaxed">{renderDiscordContent(field.value)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Image */}
              {embed.image && (
                <div className="mb-2">
                  <img 
                    src={embed.image} 
                    alt=""
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: '400px', maxWidth: '500px' }}
                  />
                </div>
              )}

              {/* Footer */}
              {(embed.footer || embed.timestamp) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  {embed.footer?.icon_url && (
                    <img 
                      src={embed.footer.icon_url} 
                      alt=""
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  {embed.footer?.text && <span>{embed.footer.text}</span>}
                  {embed.footer?.text && embed.timestamp && <span>•</span>}
                  {embed.timestamp && <span>{formatDate(embed.timestamp)}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Compose Section */}
      <div className="space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Compose</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {message.content?.length || 0}/2000 characters
          </div>
        </div>

        {/* Message Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message Content</CardTitle>
            <CardDescription>
              Use @username, #channel, or :emoji: for mentions and emojis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={message.content || ''}
                onChange={(e) => handleTextChange(e.target.value, 'main')}
                className="min-h-32 resize-none"
                maxLength={2000}
              />
              {renderAutocompleteDropdown()}
            </div>
          </CardContent>
        </Card>

        {/* Embeds */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Embeds
                </CardTitle>
                <CardDescription>
                  Add rich embeds to your message
                </CardDescription>
              </div>
              <Button onClick={addEmbed} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Embed
              </Button>
            </div>
          </CardHeader>
          
          {message.embeds && message.embeds.length > 0 && (
            <CardContent className="space-y-6">
              {message.embeds.map((embed, embedIndex) => (
                <div key={embedIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Embed {embedIndex + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmbed(embedIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Layout with thumbnail on top-right */}
                  <div className="relative">
                    {/* Thumbnail - positioned top right */}
                    <div className="absolute top-0 right-0 z-10">
                      <div className="space-y-2">
                        <Label className="text-sm">Thumbnail</Label>
                        <ImageUploadModal
                          value={embed.thumbnail}
                          onValueChange={(value) => updateEmbed(embedIndex, { ...embed, thumbnail: value })}
                          guildId={guildId}
                          title="Thumbnail"
                          trigger={
                            <div className="w-20 h-20 bg-muted border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                              {embed.thumbnail ? (
                                <img 
                                  src={embed.thumbnail} 
                                  alt="Thumbnail"
                                  className="w-full h-full rounded-lg object-cover"
                                />
                              ) : (
                                <div className="text-center">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                                  <p className="text-xs text-muted-foreground">Thumbnail</p>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </div>
                    </div>

                    {/* Main content - with right margin for thumbnail */}
                    <div className="pr-24 space-y-4">
                      {/* Author Section */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Author</Label>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <ImageUploadModal
                            value={embed.author?.icon_url}
                            onValueChange={(value) => updateEmbed(embedIndex, { 
                              ...embed, 
                              author: { ...embed.author, icon_url: value }
                            })}
                            guildId={guildId}
                            title="Author Icon"
                            trigger={
                              <div className="w-10 h-10 bg-muted border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                                {embed.author?.icon_url ? (
                                  <img 
                                    src={embed.author.icon_url} 
                                    alt="Author icon"
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            }
                          />
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Author name"
                              value={embed.author?.name || ''}
                              onChange={(e) => updateEmbed(embedIndex, { 
                                ...embed, 
                                author: { ...embed.author, name: e.target.value }
                              })}
                              maxLength={256}
                            />
                            <Input
                              placeholder="Author URL (optional)"
                              value={embed.author?.url || ''}
                              onChange={(e) => updateEmbed(embedIndex, { 
                                ...embed, 
                                author: { ...embed.author, url: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            placeholder="Embed title"
                            value={embed.title || ''}
                            onChange={(e) => updateEmbed(embedIndex, { ...embed, title: e.target.value })}
                            maxLength={256}
                          />
                        </div>

                        <div>
                          <Label>URL (optional)</Label>
                          <Input
                            placeholder="https://example.com"
                            value={embed.url || ''}
                            onChange={(e) => updateEmbed(embedIndex, { ...embed, url: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={embed.color ? decimalToHex(embed.color) : '#7289DA'}
                            onChange={(e) => updateEmbed(embedIndex, { ...embed, color: hexToDecimal(e.target.value) })}
                            className="w-16 h-9 p-1"
                          />
                          <Input
                            placeholder="#7289DA"
                            value={embed.color ? decimalToHex(embed.color) : '#7289DA'}
                            onChange={(e) => updateEmbed(embedIndex, { ...embed, color: hexToDecimal(e.target.value) })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <Label>Description</Label>
                        <div className="relative">
                          <Textarea
                            ref={(el) => { textareaRefs.current[`description-${embedIndex}`] = el; }}
                            placeholder="Embed description (supports @user, #channel, :emoji:)"
                            value={embed.description || ''}
                            onChange={(e) => handleTextChange(e.target.value, `description-${embedIndex}`)}
                            className="min-h-20"
                            maxLength={2048}
                          />
                        </div>
                      </div>

                      {/* Fields - Moved here between Description and Embed Image */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Fields</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addEmbedField(embedIndex)}
                            disabled={(embed.fields?.length || 0) >= 25}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>

                        {embed.fields?.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="border rounded p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Field {fieldIndex + 1}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEmbedField(embedIndex, fieldIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input
                                placeholder="Field name"
                                value={field.name}
                                onChange={(e) => updateEmbedField(embedIndex, fieldIndex, { ...field, name: e.target.value })}
                                maxLength={256}
                              />
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={field.inline}
                                  onCheckedChange={(checked) => updateEmbedField(embedIndex, fieldIndex, { ...field, inline: checked })}
                                />
                                <Label className="text-sm">Inline</Label>
                              </div>
                            </div>

                            <div className="relative">
                              <Textarea
                                ref={(el) => { textareaRefs.current[`field-${embedIndex}-${fieldIndex}`] = el; }}
                                placeholder="Field value (supports @user, #channel, :emoji:)"
                                value={field.value}
                                onChange={(e) => handleTextChange(e.target.value, `field-${embedIndex}-${fieldIndex}`)}
                                className="min-h-16"
                                maxLength={1024}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Embed Image - Full width, no gray padding when image exists */}
                  <div className="space-y-2">
                    <Label>Embed Image</Label>
                    <ImageUploadModal
                      value={embed.image}
                      onValueChange={(value) => updateEmbed(embedIndex, { ...embed, image: value })}
                      guildId={guildId}
                      title="Embed Image"
                      trigger={
                        embed.image ? (
                          <div className="w-full cursor-pointer group relative">
                            <img 
                              src={embed.image} 
                              alt="Embed image"
                              className="w-full rounded-lg object-contain border-2 border-transparent group-hover:border-primary/50 transition-colors"
                              style={{ maxHeight: '300px' }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 px-3 py-1 rounded-md text-sm font-medium">
                                Click to change image
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-muted border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                            <div className="text-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Click to add embed image</p>
                              <p className="text-xs text-muted-foreground mt-1">Recommended: 500x300px or similar ratio</p>
                            </div>
                          </div>
                        )
                      }
                    />
                  </div>

                  {/* Footer Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Footer</Label>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <ImageUploadModal
                        value={embed.footer?.icon_url}
                        onValueChange={(value) => updateEmbed(embedIndex, { 
                          ...embed, 
                          footer: { ...embed.footer, icon_url: value }
                        })}
                        guildId={guildId}
                        title="Footer Icon"
                        trigger={
                          <div className="w-8 h-8 bg-muted border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                            {embed.footer?.icon_url ? (
                              <img 
                                src={embed.footer.icon_url} 
                                alt="Footer icon"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        }
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="Footer text"
                          value={embed.footer?.text || ''}
                          onChange={(e) => updateEmbed(embedIndex, { 
                            ...embed, 
                            footer: { ...embed.footer, text: e.target.value }
                          })}
                          maxLength={2048}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!!embed.timestamp}
                      onCheckedChange={(checked) => updateEmbed(embedIndex, { 
                        ...embed, 
                        timestamp: checked ? new Date().toISOString() : undefined
                      })}
                    />
                    <Label>Include timestamp</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Live Preview Section */}
      {showPreview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/60 z-10 py-2">
            <Eye className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Live Preview</h3>
          </div>
          
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Discord Preview</CardTitle>
              <CardDescription>
                How your message will appear in Discord
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 border rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    P
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Project Plana</span>
                      <Badge variant="outline" className="text-xs">BOT</Badge>
                      <span className="text-xs text-muted-foreground">Today at {new Date().toLocaleTimeString()}</span>
                    </div>
                    {renderDiscordPreview()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 