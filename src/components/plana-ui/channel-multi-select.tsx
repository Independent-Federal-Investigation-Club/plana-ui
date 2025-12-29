'use client';

import React from 'react';
import { Check, ChevronDown, X, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextChannel, GuildCategory } from '@/lib/sdk';

interface ChannelMultiSelectProps {
  channels: TextChannel[];
  categories?: GuildCategory[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSelection?: number;
}

export function ChannelMultiSelect({
  channels,
  categories = [],
  value = [],
  onValueChange,
  placeholder = "Select channels",
  disabled = false,
  className,
  maxSelection
}: ChannelMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Create a map of category names for easy lookup
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (categories || []).forEach(cat => {
      map.set(cat.category_id, cat.name);
    });
    return map;
  }, [categories]);

  // Group channels by category
  const groupedChannels = React.useMemo(() => {
    const groups: { [key: string]: TextChannel[] } = {
      'No Category': []
    };

    (channels || []).forEach(channel => {
      const categoryName = channel.category_id 
        ? categoryMap.get(channel.category_id) || 'Unknown Category'
        : 'No Category';
      
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(channel);
    });

    // Sort channels within each group by position
    Object.keys(groups).forEach(groupName => {
      groups[groupName].sort((a, b) => a.position - b.position);
    });

    return groups;
  }, [channels, categoryMap]);

  const selectedChannels = React.useMemo(() => {
    return (value || []).map(channelId => (channels || []).find(channel => channel.channel_id === channelId)).filter(Boolean) as TextChannel[];
  }, [value, channels]);

  const handleSelect = (channelId: string) => {
    const newValue = value.includes(channelId)
      ? value.filter(id => id !== channelId)
      : maxSelection && value.length >= maxSelection
        ? value
        : [...value, channelId];
    
    onValueChange(newValue);
  };

  const removeChannel = (channelId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange(value.filter(id => id !== channelId));
  };

  const clearAll = () => {
    onValueChange([]);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between min-h-10 w-full", className)}
            disabled={disabled}
          >
            {selectedChannels.length > 0 ? (
              <div className="flex items-center gap-1">
                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search channels..." />
            <CommandList>
              <CommandEmpty>No channels found.</CommandEmpty>
              
              {value.length > 0 && (
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={clearAll}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear all selections
                  </CommandItem>
                </CommandGroup>
              )}

              {Object.entries(groupedChannels).map(([categoryName, categoryChannels]) => {
                if (categoryChannels.length === 0) return null;
                
                return (
                  <CommandGroup key={categoryName} heading={categoryName}>
                    {categoryChannels.map((channel) => {
                      const isSelected = value.includes(channel.channel_id);
                      const isMaxReached = maxSelection && !isSelected && value.length >= maxSelection;

                      return (
                        <CommandItem
                          key={channel.channel_id}
                          value={channel.channel_id}
                          onSelect={() => !isMaxReached && handleSelect(channel.channel_id)}
                          disabled={!!isMaxReached}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="truncate">{channel.name}</span>
                            {channel.topic && (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {channel.topic}
                              </span>
                            )}
                          </div>
                          {isMaxReached && (
                            <span className="text-xs text-muted-foreground ml-auto">Max reached</span>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected channels display */}
      {selectedChannels.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md min-h-10">
          {selectedChannels.map((channel) => (
            <Badge
              key={channel.channel_id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <Hash className="h-3 w-3" />
              <span className="text-xs truncate max-w-[120px]">{channel.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-black/10"
                onClick={(e) => removeChannel(channel.channel_id, e)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {maxSelection && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxSelection} channels selected
        </p>
      )}
    </div>
  );
}
