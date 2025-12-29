'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { MessageBuilder } from './message-builder';
import { AuthService, GuildMessage, DiscordMessage } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { MessageSquare, Save, X, Send, Eye, Settings, Hash, Lock, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { ChannelSelect } from '@/components/plana-ui/channel-select';

interface GuildMessagesTabProps {
  guildId: string;
}

export function GuildMessagesTab({ guildId }: GuildMessagesTabProps) {
  const { guildData } = useGuild();
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const result = await AuthService.getGuildMessages(guildId);
        // If message name end with - Reaction Role Message, exclude it
        const filteredMessages = result.data.filter((message: GuildMessage) => !message.name?.endsWith('- Reaction Role Message'));
        setMessages(filteredMessages);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [guildId]);

  const addMessage = () => {
    const newMessage: GuildMessage = {
      guild_id: guildId,
      channel_id: '',
      name: 'Untitled Message',
      content: '',
      embeds: [],
      components: [],
      published: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateMessageAtIndex = (index: number, updatedMessage: GuildMessage) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[index] = updatedMessage;
      return newMessages;
    });
  };

  const removeMessageAtIndex = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const setSavingState = (messageKey: string, saving: boolean) => {
    setSavingStates(prev => ({ ...prev, [messageKey]: saving }));
  };

  const startEditingTitle = (messageKey: string) => {
    setEditingTitle(messageKey);
  };

  const stopEditingTitle = () => {
    setEditingTitle(null);
  };

  const updateMessageName = (index: number, newName: string) => {
    updateMessageAtIndex(index, { ...messages[index], name: newName });
    stopEditingTitle();
  };

  const saveMessage = async (index: number, message: GuildMessage) => {
    if (!message.channel_id) {
      toast.error('Please select a channel first');
      return;
    }

    const messageKey = message.id || `temp-${index}`;
    setSavingState(messageKey, true);

    try {
      const savedMessage = message.id 
        ? await AuthService.updateGuildMessage(guildId, message.id, message)
        : await AuthService.createGuildMessage(guildId, message);
      
      updateMessageAtIndex(index, savedMessage);
      toast.success('Message saved successfully!');
    } catch (error) {
      console.error('Failed to save message:', error);
      toast.error('Failed to save message');
    } finally {
      setSavingState(messageKey, false);
    }
  };

  const deleteMessage = async (index: number, messageId?: string) => {
    // Move confirmation before API call
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    if (messageId) {
      try {
        await AuthService.deleteGuildMessage(guildId, messageId);
        toast.success('Message deleted successfully!');
      } catch (error) {
        console.error('Failed to delete message:', error);
        toast.error('Failed to delete message');
        return;
      }
    }
    removeMessageAtIndex(index);
  };

  const togglePublished = async (index: number, message: GuildMessage, newPublishedState: boolean) => {
    if (!message.id) {
      toast.error('Please save the message first');
      return;
    }

    if (!message.channel_id) {
      toast.error('Please select a channel first');
      return;
    }

    setSavingState(message.id, true);

    try {
      // Use PUT with the updated message data
      const updatedMessage = await AuthService.updateGuildMessage(guildId, message.id, {
        ...message,
        published: newPublishedState
      });
      
      updateMessageAtIndex(index, updatedMessage);
      toast.success(`Message ${updatedMessage.published ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle message status:', error);
      toast.error('Failed to update message status');
    } finally {
      setSavingState(message.id, false);
    }
  };

  const items: ItemListItem[] = messages.map((message, index) => {
    const messageKey = message.id || `temp-${index}`;
    const isSaving = savingStates[messageKey] || false;
    const isNew = !message.id;
    const isEditingThisTitle = editingTitle === messageKey;
    
    // Simplified logic: can save if there's a channel selected
    // Can publish only if message is saved AND has a channel
    const canSave = Boolean(message.channel_id);
    const canPublish = Boolean(message.id && message.channel_id);

    return {
      id: messageKey,
      title: message.name || 'Untitled Message',
      subtitle: message.channel_id 
        ? `#${guildData?.channels.find(c => c.channel_id === message.channel_id)?.name || 'Unknown Channel'}`
        : 'No channel selected',
      status: message.published ? 'Published' : 'Draft',
      statusVariant: message.published ? 'default' : 'secondary',
      titleAction: isEditingThisTitle ? (
        <div className="flex items-center gap-2">
          <Input
            defaultValue={message.name || 'Untitled Message'}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateMessageName(index, e.currentTarget.value);
              } else if (e.key === 'Escape') {
                stopEditingTitle();
              }
            }}
            onBlur={(e) => updateMessageName(index, e.target.value)}
            autoFocus
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => startEditingTitle(messageKey)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      ),
      actions: [
        {
          label: 'Save',
          onClick: () => saveMessage(index, message),
          variant: 'default',
          icon: Save,
          disabled: !canSave || isSaving
        },
        {
          label: message.published ? 'Unpublish' : 'Publish',
          onClick: () => togglePublished(index, message, !message.published),
          variant: message.published ? 'outline' : 'default',
          icon: message.published ? Eye : Send,
          disabled: !canPublish || isSaving
        },
        {
          label: 'Delete',
          onClick: () => deleteMessage(index, message.id),
          variant: 'destructive',
          icon: X,
          disabled: isSaving
        }
      ],
      content: (
        <MessageForm
          message={message}
          onChange={(updatedMessage) => updateMessageAtIndex(index, updatedMessage)}
          onTogglePublished={(newState) => togglePublished(index, message, newState)}
          guildData={guildData}
          guildId={guildId}
          isNew={isNew}
          isSaving={isSaving}
        />
      )
    };
  });

  return (
    <ItemList
      title="Custom Messages"
      description="Create and manage custom messages that can be sent to specific channels"
      icon={MessageSquare}
      items={items}
      onAddItem={addMessage}
      addItemLabel="Create Message"
      showSaveAll={false}
      loading={loading}
      emptyMessage="No custom messages found"
      emptyDescription="Create your first custom message to get started"
    />
  );
}

interface MessageFormProps {
  message: GuildMessage;
  onChange: (message: GuildMessage) => void;
  onTogglePublished: (newState: boolean) => void;
  guildData: any;
  guildId: string;
  isNew: boolean;
  isSaving: boolean;
}

function MessageForm({ 
  message, 
  onChange, 
  onTogglePublished, 
  guildData, 
  guildId, 
  isNew, 
  isSaving 
}: MessageFormProps) {
  const updateField = (field: keyof GuildMessage, value: any) => {
    onChange({ ...message, [field]: value });
  };

  const updateMessageContent = (content: DiscordMessage) => {
    onChange({
      ...message,
      content: content.content,
      embeds: content.embeds,
      components: content.components
    });
  };

  const handlePublishedToggle = (published: boolean) => {
    if (message.id && message.channel_id) {
      // For saved messages with channel, use API to sync with Discord
      onTogglePublished(published);
    } else {
      // For new messages or messages without channel, just update local state
      updateField('published', published);
    }
  };

  const channelIsLocked = !isNew && Boolean(message.channel_id);

  return (
    <div className="space-y-6">
      {/* Message Details Section */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
        <div className="space-y-2">
          <Label className="text-foreground">
            Message Name
          </Label>
          <Input
            value={message.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter a name for this message"
            disabled={isSaving}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            A friendly name to identify this message in the list
          </p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Hash className="h-4 w-4" />
            Target Channel
            {channelIsLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </Label>
          <ChannelSelect
            channels={guildData?.channels || []}
            categories={guildData?.categories || []}
            value={message.channel_id || null}
            onValueChange={(value) => updateField('channel_id', value || null)}
            placeholder={channelIsLocked ? "Channel cannot be changed" : "Select channel"}
            disabled={channelIsLocked || isSaving}
          />
          <p className="text-xs text-muted-foreground">
            {channelIsLocked 
              ? "Channel cannot be changed once saved. Create a new message for a different channel."
              : "The channel where this message will be sent when published"
            }
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Settings className="h-4 w-4" />
            Message Status
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={message.published}
              onCheckedChange={handlePublishedToggle}
              disabled={isSaving || (!message.id && !message.channel_id)}
            />
            <Label className="text-sm text-muted-foreground">
              {message.published ? 'Published' : 'Draft'}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {!message.channel_id
              ? 'Select a channel to enable publishing'
              : !message.id 
                ? 'Save the message first to sync publish status with Discord'
                : message.published 
                  ? 'Message is active and can be sent'
                  : 'Message is saved as draft'
            }
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      {!isNew && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Saved
          </div>
          {message.message_id && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Discord ID: {message.message_id}
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Message Content Section */}
      <div className="space-y-4">
        <Label className="text-base font-medium text-foreground">Message Content</Label>
        <MessageBuilder
          message={{
            content: message.content,
            embeds: message.embeds,
            components: message.components
          }}
          onChange={updateMessageContent}
          placeholder="Enter your custom message content..."
          guildId={guildId}
        />
      </div>
    </div>
  );
} 