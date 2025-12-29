'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { MessageBuilder } from './message-builder';
import { AuthService, ReactRole, ReactRoleAssignment, DiscordMessage,  ButtonComponent, MenuComponent, GuildEmoji } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { Gamepad2, Save, X, Plus, Settings, Hash, Lock, Pencil, Send, Eye, MousePointer, Menu, Smile } from 'lucide-react';
import { toast } from 'sonner';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { EmojiSelect } from '@/components/plana-ui/emoji-select';

interface GuildReactRolesTabProps {
  guildId: string;
}

// Extended ReactRole interface to include message content and interactive components
interface ExtendedReactRole extends ReactRole {
  content?: string;
  embeds?: any[];
  components?: (ButtonComponent | MenuComponent)[];
  reactions?: GuildEmoji[];
  channel_id?: string;
  guild_message_id?: string; // Store the guild message database ID for updates/deletes
  // Trigger type - user can only choose one
  triggerType: 'emoji' | 'button' | 'select';
}

export function GuildReactRolesTab({ guildId }: GuildReactRolesTabProps) {
  const { guildData } = useGuild();
  const [reactRoles, setReactRoles] = useState<ExtendedReactRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchReactRoles = async () => {
      try {
        // Fetch both react roles and guild messages to get channel information
        const [reactRolesResult, messagesResult] = await Promise.all([
          AuthService.getReactRoles(guildId),
          AuthService.getGuildMessages(guildId, 100, 0) // Get more messages to find matches
        ]);

                  const extendedRoles = reactRolesResult.data.map((role: ReactRole) => {
          // Find the associated message to get channel_id
          const associatedMessage = messagesResult.data.find(
            (msg: any) =>  msg.message_id === role.message_id
          );

          // Determine trigger type from existing assignments
          const firstAssignment = role.role_assignments[0];
          let triggerType: 'emoji' | 'button' | 'select' = 'emoji';
          
          if (firstAssignment) {
            if (firstAssignment.trigger_id.includes('-')) {
              triggerType = 'select';
            } else if (firstAssignment.trigger_id.startsWith('btn_')) {
              triggerType = 'button';
            }
          }
          
          // Reconstruct reactions array for emoji type
          let reactions: GuildEmoji[] = [];
          if (triggerType === 'emoji') {
            reactions = role.role_assignments.map(assignment => {
              const triggerId = assignment.trigger_id;
              
              // Check if it's a custom emoji ID (numeric IDs are custom emojis)
              const customEmoji = guildData?.emojis?.find((e: GuildEmoji) => e.emoji_id === triggerId);
              if (customEmoji) {
                return {
                  emoji_id: customEmoji.emoji_id,
                  name: customEmoji.name,
                  animated: customEmoji.animated
                };
              } else {
                // Unicode emoji - trigger_id is the emoji name/unicode
                return {
                  name: triggerId,
                  animated: false
                };
              }
            });
          }
          
          return {
            ...role,
            content: associatedMessage?.content || '',
            embeds: associatedMessage?.embeds || [],
            components: associatedMessage?.components || [],
            reactions,
            triggerType,
            channel_id: associatedMessage?.channel_id || '', // Set channel_id from message
            guild_message_id: associatedMessage?.id || '' // Store guild message database ID
          };
        });

        setReactRoles(extendedRoles);
      } catch (error) {
        console.error('Failed to fetch react roles:', error);
        setReactRoles([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have guild data (needed for emoji reconstruction)
    if (guildData) {
      fetchReactRoles();
    }
  }, [guildId, guildData]);

  const addReactRole = () => {
    const newReactRole: ExtendedReactRole = {
      guild_id: guildId,
      message_id: '',
      name: 'Untitled Reaction Role',
      content: '',
      embeds: [],
      components: [],
      reactions: [],
      channel_id: '',
      guild_message_id: '',
      role_assignments: [],
      enabled: true,
      triggerType: 'emoji' // Default to emoji
    };
    setReactRoles(prev => [...prev, newReactRole]);
    // New roles are automatically considered dirty (no need to explicitly mark)
  };

  const updateReactRoleAtIndex = (index: number, updatedRole: ExtendedReactRole) => {
    setReactRoles(prev => {
      const newRoles = [...prev];
      newRoles[index] = updatedRole;
      return newRoles;
    });
  };

  const removeReactRoleAtIndex = (index: number) => {
    setReactRoles(prev => prev.filter((_, i) => i !== index));
  };

  const setSavingState = (roleKey: string, saving: boolean) => {
    setSavingStates(prev => ({ ...prev, [roleKey]: saving }));
  };

  const startEditingTitle = (roleKey: string) => {
    setEditingTitle(roleKey);
  };

  const stopEditingTitle = () => {
    setEditingTitle(null);
  };

  const updateRoleName = (index: number, newName: string) => {
    updateReactRoleAtIndex(index, { ...reactRoles[index], name: newName });
    stopEditingTitle();
  };

  // Simplified: Just track if roles have unsaved changes
  const hasUnsavedChanges = (reactRole: ExtendedReactRole): boolean => {
    return !reactRole.id || // New roles always have unsaved changes
           reactRole.role_assignments.length === 0; // Or incomplete roles
  };

  /**
   * Save a reaction role - simplified approach
   */
  const saveReactRole = async (index: number, reactRole: ExtendedReactRole) => {
    // Basic validation
    if (!reactRole.channel_id || (!reactRole.content && (!reactRole.embeds?.length)) || !reactRole.role_assignments.length) {
      toast.error('Please complete all required fields');
      return;
    }

    const roleKey = reactRole.id || `temp-${index}`;
    setSavingState(roleKey, true);

    try {
      // 1. Prepare complete message data
      const messageData = {
        guild_id: guildId,
        channel_id: reactRole.channel_id,
        message_id: reactRole.message_id || undefined,
        name: `${reactRole.name} - Reaction Role Message`,
        content: reactRole.content || '',
        embeds: reactRole.embeds || [],
        components: reactRole.triggerType !== 'emoji' ? (reactRole.components || []) : [],
        reactions: reactRole.triggerType === 'emoji' ? (reactRole.reactions || []) : [],
        published: reactRole.enabled
      };

      // 2. Create or update message
      const savedMessage = reactRole.guild_message_id
        ? await AuthService.updateGuildMessage(guildId, reactRole.guild_message_id, messageData)
        : await AuthService.createGuildMessage(guildId, messageData);

      // 3. Prepare role data with correct trigger_ids
      const roleAssignments = reactRole.role_assignments.map((assignment, idx) => ({
        role_ids: assignment.role_ids,
        trigger_id: reactRole.triggerType === 'emoji' && reactRole.reactions?.[idx]
          ? (reactRole.reactions[idx].emoji_id || reactRole.reactions[idx].name)
          : assignment.trigger_id
      }));

      const roleData = {
        guild_id: guildId,
        message_id: savedMessage.message_id || '',
        name: reactRole.name || 'Untitled Reaction Role',
        role_assignments: roleAssignments,
        enabled: reactRole.enabled
      };

      // 4. Create or update role
      const savedRole = reactRole.id
        ? await AuthService.updateReactRole(guildId, reactRole.id, roleData)
        : await AuthService.createReactRole(guildId, roleData);

      // 5. Update local state with saved data
      updateReactRoleAtIndex(index, {
        ...savedRole,
        content: savedMessage.content,
        embeds: savedMessage.embeds,
        components: savedMessage.components,
        reactions: savedMessage.reactions,
        channel_id: savedMessage.channel_id,
        guild_message_id: savedMessage.id,
        triggerType: reactRole.triggerType
      });

      toast.success('Reaction role saved successfully!');
    } catch (error) {
      console.error('Failed to save reaction role:', error);
      toast.error('Failed to save reaction role');
    } finally {
      setSavingState(roleKey, false);
    }
  };

  const deleteReactRole = async (index: number, roleId?: string) => {
    if (!confirm('Are you sure you want to delete this reaction role?')) return;

    const reactRole = reactRoles[index];
    const roleKey = roleId || `temp-${index}`;
    setSavingState(roleKey, true);

    try {
      // Delete from API if it exists
      if (roleId) {
        await AuthService.deleteReactRole(guildId, roleId);
        
        // Clean up associated message
        if (reactRole.guild_message_id) {
          await AuthService.deleteGuildMessage(guildId, reactRole.guild_message_id).catch(console.warn);
        }
      }
      
      removeReactRoleAtIndex(index);
      toast.success('Reaction role deleted successfully!');
    } catch (error) {
      console.error('Failed to delete reaction role:', error);
      toast.error('Failed to delete reaction role');
    } finally {
      setSavingState(roleKey, false);
    }
  };

  const toggleEnabled = async (index: number, reactRole: ExtendedReactRole, newEnabledState: boolean) => {
    if (!reactRole.id) {
      toast.error('Please save the reaction role first');
      return;
    }

    setSavingState(reactRole.id, true);

    try {
      // Optimized: Only update the enabled field, not all role data
      const roleData: Omit<ReactRole, 'id' | 'updated_at'> = {
        guild_id: guildId,
        message_id: reactRole.message_id,
        name: reactRole.name || 'Untitled Reaction Role',
        role_assignments: reactRole.role_assignments, // Use existing assignments as-is
        enabled: newEnabledState
      };

      const updatedRole = await AuthService.updateReactRole(guildId, reactRole.id, roleData);
      
      // Simple state update - just change the enabled flag
      updateReactRoleAtIndex(index, { 
        ...reactRole,
        enabled: updatedRole.enabled
      });
      
      toast.success(`Reaction role ${newEnabledState ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle reaction role status:', error);
      toast.error('Failed to update reaction role status');
    } finally {
      setSavingState(reactRole.id, false);
    }
  };

  const items: ItemListItem[] = reactRoles.map((reactRole, index) => {
    const roleKey = reactRole.id || `temp-${index}`;
    const isSaving = savingStates[roleKey] || false;
    const isNew = !reactRole.id;
    const isEditingThisTitle = editingTitle === roleKey;
    
    const canSave = Boolean(
      reactRole.channel_id && 
      (reactRole.content || (reactRole.embeds && reactRole.embeds.length > 0)) &&
      reactRole.role_assignments.length > 0
    );
    const canToggle = Boolean(reactRole.id);

    return {
      id: roleKey,
      title: reactRole.name || 'Untitled Reaction Role',
      subtitle: reactRole.channel_id 
        ? `#${guildData?.channels.find(c => c.channel_id === reactRole.channel_id)?.name || 'Unknown Channel'} • ${reactRole.role_assignments.length} assignment(s)`
        : 'No channel selected',
      status: reactRole.enabled ? 'Active' : 'Disabled',
      statusVariant: reactRole.enabled ? 'default' : 'secondary',
      titleAction: isEditingThisTitle ? (
        <div className="flex items-center gap-2">
          <Input
            defaultValue={reactRole.name || 'Untitled Reaction Role'}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateRoleName(index, e.currentTarget.value);
              } else if (e.key === 'Escape') {
                stopEditingTitle();
              }
            }}
            onBlur={(e) => updateRoleName(index, e.target.value)}
            autoFocus
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => startEditingTitle(roleKey)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      ),
      actions: [
        {
          label: 'Save',
          onClick: () => saveReactRole(index, reactRole),
          variant: 'default',
          icon: Save,
          disabled: !canSave || isSaving
        },
        {
          label: reactRole.enabled ? 'Disable' : 'Enable',
          onClick: () => toggleEnabled(index, reactRole, !reactRole.enabled),
          variant: reactRole.enabled ? 'outline' : 'default',
          icon: reactRole.enabled ? Eye : Send,
          disabled: !canToggle || isSaving
        },
        {
          label: 'Delete',
          onClick: () => deleteReactRole(index, reactRole.id),
          variant: 'destructive',
          icon: X,
          disabled: isSaving
        }
      ],
      content: (
        <ReactRoleForm
          reactRole={reactRole}
          onChange={(updatedRole) => updateReactRoleAtIndex(index, updatedRole)}
          onToggleEnabled={(newState) => toggleEnabled(index, reactRole, newState)}
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
      title="Reaction Roles"
      description="Create reaction role systems where users can assign themselves roles by reacting to messages"
      icon={Gamepad2}
      items={items}
      onAddItem={addReactRole}
      addItemLabel="Create Reaction Role"
      showSaveAll={false}
      loading={loading}
      emptyMessage="No reaction roles configured"
      emptyDescription="Create your first reaction role system to get started"
    />
  );
}
interface ReactRoleFormProps {
  reactRole: ExtendedReactRole;
  onChange: (reactRole: ExtendedReactRole) => void;
  onToggleEnabled: (newState: boolean) => void;
  guildData: any;
  guildId: string;
  isNew: boolean;
  isSaving: boolean;
}

function ReactRoleForm({ 
  reactRole, 
  onChange, 
  onToggleEnabled, 
  guildData, 
  guildId, 
  isNew, 
  isSaving 
}: ReactRoleFormProps) {
  const updateField = (field: keyof ExtendedReactRole, value: any) => {
    onChange({ ...reactRole, [field]: value });
  };

  const updateMessageContent = (content: DiscordMessage) => {
    onChange({
      ...reactRole,
      content: content.content,
      embeds: content.embeds
    });
  };

  const handleEnabledToggle = (enabled: boolean) => {
    if (reactRole.id) {
      onToggleEnabled(enabled);
    } else {
      updateField('enabled', enabled);
    }
  };

  const channelIsLocked = !isNew && Boolean(reactRole.channel_id);

  // When trigger type changes, wipe all data and start fresh
  const changeTriggerType = (newType: 'emoji' | 'button' | 'select') => {
    // If there are existing assignments and it's a different type, show confirmation
    if (reactRole.role_assignments.length > 0 && reactRole.triggerType !== newType) {
      const confirmMessage = `Changing trigger type will clear all existing configurations. Continue?`;
      
      if (!confirm(confirmMessage)) {
        return; // User cancelled the change
      }
    }
    // Completely wipe all data to start fresh
    onChange({
      ...reactRole,
      triggerType: newType,
      components: [],
      reactions: [],
      role_assignments: [] 
    });
  };

  // Add role assignment based on trigger type
  const addRoleAssignment = () => {
    let newAssignment: ReactRoleAssignment;
    let newComponents = [...(reactRole.components || [])];
    let newReactions = [...(reactRole.reactions || [])];

    switch (reactRole.triggerType) {
      case 'emoji':
        const defaultEmoji: GuildEmoji = { name: '🎮', animated: false };
        newAssignment = {
          role_ids: [],
          trigger_id: '🎮' // Will be updated when emoji is selected
        };
        newReactions.push(defaultEmoji);
        break;
      
      case 'button':
        const buttonIndex = reactRole.role_assignments.length + 1;
        const buttonId = `btn_${buttonIndex}`;
        const newButton: ButtonComponent = {
          custom_id: buttonId,
          label: `Button ${buttonIndex}`,
          style: 1
        };
        newComponents.push(newButton);
        newAssignment = {
          role_ids: [],
          trigger_id: buttonId
        };
        break;
      
      case 'select':
        if (reactRole.components?.length === 0) {
          // Create the select menu first
          const menuId = `menu_${Date.now()}`;
          const newMenu: MenuComponent = {
            custom_id: menuId,
            placeholder: 'Select your roles...',
            min_values: 1,
            max_values: 1,
            options: [{
              label: 'Option 1',
              value: 'option1',
              default: false
            }]
          };
          newComponents.push(newMenu);
          newAssignment = {
            role_ids: [],
            trigger_id: `${menuId}-option1`
          };
        } else {
          // Add new option to existing menu
          const menu = reactRole.components?.[0] as MenuComponent;
          const optionIndex = menu.options.length + 1;
          const optionValue = `option${optionIndex}`;
          const updatedMenu = {
            ...menu,
            options: [...menu.options, {
              label: `Option ${optionIndex}`,
              value: optionValue,
              default: false
            }]
          };
          newComponents[0] = updatedMenu;
          newAssignment = {
            role_ids: [],
            trigger_id: `${menu.custom_id}-${optionValue}`
          };
        }
        break;
      
      default:
        return;
    }

    onChange({
      ...reactRole,
      components: newComponents,
      reactions: newReactions,
      role_assignments: [...reactRole.role_assignments, newAssignment]
    });
  };

  const updateRoleAssignment = (index: number, assignment: ReactRoleAssignment) => {
    const newAssignments = [...reactRole.role_assignments];
    newAssignments[index] = assignment;
    updateField('role_assignments', newAssignments);
  };

  const removeRoleAssignment = (index: number) => {
    const assignment = reactRole.role_assignments[index];
    const newAssignments = [...reactRole.role_assignments];
    newAssignments.splice(index, 1);

    // For emoji type, also remove the corresponding reaction
    if (reactRole.triggerType === 'emoji') {
      const newReactions = [...(reactRole.reactions || [])];
      newReactions.splice(index, 1);
      onChange({
        ...reactRole,
        reactions: newReactions,
        role_assignments: newAssignments
      });
      return;
    }

    // For select menu, also remove the option
    if (reactRole.triggerType === 'select' && assignment.trigger_id.includes('-')) {
      const [menuId, optionValue] = assignment.trigger_id.split('-');
      const menu = reactRole.components?.[0] as MenuComponent;
      if (menu && menu.custom_id === menuId) {
        const updatedMenu = {
          ...menu,
          options: menu.options.filter(opt => opt.value !== optionValue)
        };
        onChange({
          ...reactRole,
          components: updatedMenu.options.length > 0 ? [updatedMenu] : [],
          role_assignments: newAssignments
        });
        return;
      }
    }

    // For button, also remove the specific component
    if (reactRole.triggerType === 'button') {
      const newComponents = reactRole.components?.filter(comp => comp.custom_id !== assignment.trigger_id) || [];
      onChange({
        ...reactRole,
        components: newComponents,
        role_assignments: newAssignments
      });
      return;
    }

    updateField('role_assignments', newAssignments);
  };

  return (
    <div className="space-y-6">
      {/* Basic Details Section */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
        <div className="space-y-2">
          <Label className="text-foreground">Reaction Role Name</Label>
          <Input
            value={reactRole.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter a name for this reaction role system"
            disabled={isSaving}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            A friendly name to identify this reaction role system in the list
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
            value={reactRole.channel_id || null}
            onValueChange={(value) => updateField('channel_id', value || null)}
            placeholder={channelIsLocked ? "Channel cannot be changed" : "Select channel"}
            disabled={channelIsLocked || isSaving}
          />
          <p className="text-xs text-muted-foreground">
            {channelIsLocked 
              ? "Channel cannot be changed once saved."
              : "The channel where this reaction role message will be sent"
            }
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Settings className="h-4 w-4" />
            System Status
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={reactRole.enabled}
              onCheckedChange={handleEnabledToggle}
              disabled={isSaving}
            />
            <Label className="text-sm text-muted-foreground">
              {reactRole.enabled ? 'Active' : 'Disabled'}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {reactRole.enabled 
              ? 'Reaction role system is active and functioning'
              : 'Reaction role system is disabled'
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
          {reactRole.message_id && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Message ID: {reactRole.message_id}
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
            content: reactRole.content,
            embeds: reactRole.embeds
          }}
          onChange={updateMessageContent}
          placeholder="Enter your reaction role message content..."
          guildId={guildId}
        />
      </div>

      <Separator />

      {/* Role Assignment Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Role Assignment Triggers</Label>
            <p className="text-sm text-muted-foreground">
              Choose how users will trigger role assignments (only one type allowed per configuration)
            </p>
          </div>
        </div>

        {/* Trigger Type Selection - Improved Visual Design */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">How will users get roles?</Label>
            <p className="text-sm text-muted-foreground">
              Choose interaction method
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Emoji Option */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                reactRole.triggerType === 'emoji' 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}
              onClick={() => changeTriggerType('emoji')}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-full ${
                  reactRole.triggerType === 'emoji' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <Smile className={`h-5 w-5 ${
                    reactRole.triggerType === 'emoji' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Emoji Reactions</h3>
                  <p className="text-xs text-muted-foreground">
                    Users react with emojis
                  </p>
                </div>
              </div>
              {reactRole.triggerType === 'emoji' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>

            {/* Button Option */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                reactRole.triggerType === 'button' 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}
              onClick={() => changeTriggerType('button')}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-full ${
                  reactRole.triggerType === 'button' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <MousePointer className={`h-5 w-5 ${
                    reactRole.triggerType === 'button' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Interactive Buttons</h3>
                  <p className="text-xs text-muted-foreground">
                    Users click Discord buttons
                  </p>
                </div>
              </div>
              {reactRole.triggerType === 'button' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>

            {/* Select Menu Option */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                reactRole.triggerType === 'select' 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}
              onClick={() => changeTriggerType('select')}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-full ${
                  reactRole.triggerType === 'select' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <Menu className={`h-5 w-5 ${
                    reactRole.triggerType === 'select' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Dropdown Menu</h3>
                  <p className="text-xs text-muted-foreground">
                    Users pick from dropdown
                  </p>
                </div>
              </div>
              {reactRole.triggerType === 'select' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Role Assignments - Improved Design */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {reactRole.triggerType === 'emoji' && 'Emoji Assignments'}
                {reactRole.triggerType === 'button' && 'Button Assignments'}
                {reactRole.triggerType === 'select' && 'Menu Options'}
              </Label>
              <p className="text-sm text-muted-foreground">
                Configure triggers and their assigned roles
              </p>
            </div>
            {reactRole.role_assignments.length > 0 && (
              <Button onClick={addRoleAssignment} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Add {reactRole.triggerType === 'emoji' ? 'Emoji' : reactRole.triggerType === 'button' ? 'Button' : 'Option'}
              </Button>
            )}
          </div>

          {reactRole.role_assignments.length > 0 ? (
            <div className="space-y-3">
              {reactRole.role_assignments.map((assignment, index) => (
                <RoleAssignmentCard
                  key={index}
                  assignment={assignment}
                  index={index}
                  triggerType={reactRole.triggerType}
                  guildData={guildData}
                  reactRole={reactRole}
                  onUpdate={(updated) => updateRoleAssignment(index, updated)}
                  onRemove={() => removeRoleAssignment(index)}
                  onChange={onChange}
                />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10">
                <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                  {reactRole.triggerType === 'emoji' && <Smile className="h-8 w-8 text-muted-foreground" />}
                  {reactRole.triggerType === 'button' && <MousePointer className="h-8 w-8 text-muted-foreground" />}
                  {reactRole.triggerType === 'select' && <Menu className="h-8 w-8 text-muted-foreground" />}
                </div>
                <h3 className="font-medium text-lg mb-2">Ready to create assignments?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add {reactRole.triggerType} triggers that assign roles to users
                </p>
                <Button onClick={addRoleAssignment} size="lg" className="shadow-sm">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First {reactRole.triggerType === 'emoji' ? 'Emoji Assignment' : reactRole.triggerType === 'button' ? 'Button' : 'Menu Option'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}



// Unified Role Assignment Card Component
interface RoleAssignmentCardProps {
  assignment: ReactRoleAssignment;
  index: number;
  triggerType: 'emoji' | 'button' | 'select';
  guildData: any;
  reactRole: ExtendedReactRole;
  onUpdate: (assignment: ReactRoleAssignment) => void;
  onRemove: () => void;
  onChange: (reactRole: ExtendedReactRole) => void;
}

function RoleAssignmentCard({ 
  assignment, 
  index, 
  triggerType, 
  guildData, 
  reactRole, 
  onUpdate, 
  onRemove, 
  onChange 
}: RoleAssignmentCardProps) {

  const updateComponentProperty = (property: string, value: any) => {
    if (triggerType === 'button') {
      const buttonIndex = reactRole.components?.findIndex(comp => comp.custom_id === assignment.trigger_id);
      if (buttonIndex !== -1 && buttonIndex !== undefined) {
        const button = reactRole.components?.[buttonIndex] as ButtonComponent;
        const updatedButton = { ...button, [property]: value };
        const newComponents = [...(reactRole.components || [])];
        newComponents[buttonIndex] = updatedButton;
        onChange({
          ...reactRole,
          components: newComponents
        });
      }
    } else if (triggerType === 'select') {
      const menu = reactRole.components?.[0] as MenuComponent;
      if (menu) {
        const [, optionValue] = assignment.trigger_id.split('-');
        const optionIndex = menu.options.findIndex(opt => opt.value === optionValue);
        if (optionIndex !== -1) {
          const updatedOptions = [...menu.options];
          updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [property]: value };
          const updatedMenu = { ...menu, options: updatedOptions };
          onChange({
            ...reactRole,
            components: [updatedMenu]
          });
        }
      }
    }
  };

  const renderTriggerConfig = () => {
    switch (triggerType) {
      case 'emoji':
        return (
          <EmojiSelect
            value={reactRole.reactions?.[index] || null}
            onValueChange={(emoji) => {
              const newReactions = [...(reactRole.reactions || [])];
              if (emoji) {
                newReactions[index] = emoji;
                onUpdate({
                  ...assignment,
                  trigger_id: emoji.emoji_id || emoji.name // Keep for API compatibility
                });
              } else {
                newReactions.splice(index, 1);
                onUpdate({
                  ...assignment,
                  trigger_id: ''
                });
              }
              onChange({
                ...reactRole,
                reactions: newReactions
              });
            }}
            guildEmojis={guildData?.emojis || []}
            placeholder="Choose emoji..."
          />
        );
      
      case 'button':
        const button = reactRole.components?.find(comp => comp.custom_id === assignment.trigger_id) as ButtonComponent;
        return (
          <div className="space-y-3">
            <Input
              value={button?.label || ''}
              onChange={(e) => updateComponentProperty('label', e.target.value)}
              placeholder="Button text"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={button?.style?.toString() || '1'}
                onValueChange={(value) => updateComponentProperty('style', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primary</SelectItem>
                  <SelectItem value="2">Secondary</SelectItem>
                  <SelectItem value="3">Success</SelectItem>
                  <SelectItem value="4">Danger</SelectItem>
                </SelectContent>
              </Select>
              <EmojiSelect
                value={button?.emoji || null}
                onValueChange={(emoji) => {
                  updateComponentProperty('emoji', emoji || undefined);
                }}
                guildEmojis={guildData?.emojis || []}
                placeholder="Emoji (optional)"
              />
            </div>
          </div>
        );
      
      case 'select':
        const menu = reactRole.components?.[0] as MenuComponent;
        const [, optionValue] = assignment.trigger_id.split('-');
        const option = menu?.options.find(opt => opt.value === optionValue);
        return (
          <div className="space-y-3">
            {index === 0 && (
              <Input
                value={menu?.placeholder || ''}
                onChange={(e) => {
                  const updatedMenu = { ...menu, placeholder: e.target.value };
                  onChange({ ...reactRole, components: [updatedMenu] });
                }}
                placeholder="Menu placeholder text..."
              />
            )}
            <Input
              value={option?.label || ''}
              onChange={(e) => updateComponentProperty('label', e.target.value)}
              placeholder="Option label"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={option?.value || ''}
                onChange={(e) => {
                  const oldValue = option?.value;
                  updateComponentProperty('value', e.target.value);
                  // Update trigger_id to match new value
                  if (oldValue && menu) {
                    onUpdate({ ...assignment, trigger_id: `${menu.custom_id}-${e.target.value}` });
                  }
                }}
                placeholder="option_value"
              />
              <EmojiSelect
                value={option?.emoji || null}
                onValueChange={(emoji) => {
                  updateComponentProperty('emoji', emoji || undefined);
                }}
                guildEmojis={guildData?.emojis || []}
                placeholder="Emoji (optional)"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="group relative p-4 border border-muted-foreground/10 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
            {triggerType === 'emoji' && <Smile className="h-3 w-3 text-primary" />}
            {triggerType === 'button' && <MousePointer className="h-3 w-3 text-primary" />}
            {triggerType === 'select' && <Menu className="h-3 w-3 text-primary" />}
          </div>
          <span className="text-sm font-medium">
            {triggerType === 'emoji' && `Emoji ${index + 1}`}
            {triggerType === 'button' && `Button ${index + 1}`}
            {triggerType === 'select' && `Option ${index + 1}`}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Left/Right Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Trigger Configuration */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            {triggerType === 'emoji' && 'Emoji'}
            {triggerType === 'button' && 'Button'}
            {triggerType === 'select' && 'Menu Option'}
          </Label>
          {renderTriggerConfig()}
        </div>

        {/* Right: Role Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Target Roles</Label>
          <RoleMultiSelect
            roles={guildData?.roles || []}
            value={assignment.role_ids}
            onValueChange={(value) => onUpdate({ ...assignment, role_ids: value })}
            placeholder="Select roles..."
          />
          {assignment.role_ids.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {assignment.role_ids.length} role{assignment.role_ids.length === 1 ? '' : 's'} selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}