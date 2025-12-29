'use client';

import React from 'react';
import { Check, ChevronDown, Hash } from 'lucide-react';
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
import { TextChannel, GuildCategory } from '@/lib/sdk';

interface ChannelSelectProps {
  channels: TextChannel[];
  categories?: GuildCategory[];
  value?: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export function ChannelSelect({
  channels,
  categories = [],
  value,
  onValueChange,
  placeholder = "Select a channel",
  disabled = false,
  className,
  allowClear = true
}: ChannelSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Create a map of category names for easy lookup
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(cat => {
      map.set(cat.category_id, cat.name);
    });
    return map;
  }, [categories]);

  // Group channels by category
  const groupedChannels = React.useMemo(() => {
    const groups: { [key: string]: TextChannel[] } = {
      'No Category': []
    };

    channels.forEach(channel => {
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

  const selectedChannel = React.useMemo(() => {
    if (!value) return null;
    return channels.find(channel => channel.channel_id === value) || null;
  }, [value, channels]);

  const handleSelect = (channelId: string | null) => {
    if (channelId === null || channelId === '__clear__') {
      onValueChange(null);
    } else {
      onValueChange(channelId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          {selectedChannel ? (
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>{selectedChannel.name}</span>
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
            
            {allowClear && value && (
              <CommandGroup>
                <CommandItem
                  value="__clear__"
                  onSelect={() => handleSelect(null)}
                  className="text-muted-foreground"
                >
                  <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                  Clear selection
                </CommandItem>
              </CommandGroup>
            )}

            {Object.entries(groupedChannels).map(([categoryName, categoryChannels]) => {
              if (categoryChannels.length === 0) return null;
              
              return (
                <CommandGroup key={categoryName} heading={categoryName}>
                  {categoryChannels.map((channel) => (
                    <CommandItem
                      key={channel.channel_id}
                      value={channel.channel_id}
                      onSelect={() => handleSelect(channel.channel_id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === channel.channel_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{channel.name}</span>
                        {channel.topic && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {channel.topic}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 