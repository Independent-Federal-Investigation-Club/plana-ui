'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { GuildEmoji } from '@/lib/sdk';

// Common unicode emojis for reactions
const COMMON_EMOJIS = [
  '👍', '👎', '❤️', '🎉', '😢', '😡', '😮', '😂',
  '🎮', '⚡', '🔥', '💎', '🏆', '⭐', '🎵', '🎨',
  '🚀', '💰', '🎯', '🛡️', '⚔️', '🏹', '🔮', '💊',
  '🟢', '🔴', '🟡', '🟠', '🟣', '🔵', '⚪', '⚫',
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
  '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'
];

interface EmojiSelectProps {
  value: GuildEmoji | null;
  onValueChange: (emoji: GuildEmoji | null) => void;
  guildEmojis: GuildEmoji[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EmojiSelect({ 
  value, 
  onValueChange, 
  guildEmojis, 
  placeholder = "Select emoji",
  disabled = false,
  className = ""
}: EmojiSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filteredCommonEmojis = COMMON_EMOJIS.filter(emoji => 
    !search || emoji.includes(search)
  );

  const filteredGuildEmojis = guildEmojis.filter(emoji =>
    !search || emoji.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEmojiSelect = (emoji: string, isCustom?: boolean, emojiData?: GuildEmoji) => {
    if (isCustom && emojiData) {
      // Custom Discord emoji - exclude URL from returned object
      onValueChange(emojiData);
    } else {
      // Unicode emoji - create GuildEmoji object
      onValueChange({
        name: emoji,
        animated: false
      });
    }
    setOpen(false);
    setSearch(''); // Reset search when closing
  };

  const handleClear = () => {
    onValueChange(null);
    setOpen(false);
  };

  const displayValue = () => {
    if (!value) return placeholder;
    
    // Custom emoji with emoji_id
    if (value.emoji_id) {
      return (
        <div className="flex items-center gap-2">
          <img src={value.url} alt={value.name} className="w-5 h-5" />
          <span>:{value.name}:</span>
        </div>
      );
    }
    
    // Unicode emoji
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{value.name}</span>
        <span>Unicode emoji</span>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`justify-start ${className}`}
          disabled={disabled}
        >
          {displayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Tabs defaultValue="unicode">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unicode">Unicode</TabsTrigger>
            <TabsTrigger value="custom">Server ({guildEmojis.length})</TabsTrigger>
          </TabsList>
          
          <div className="p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emojis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {value && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClear}
                className="w-full"
              >
                Clear Selection
              </Button>
            )}
          </div>

          <TabsContent value="unicode" className="max-h-60 overflow-y-auto p-3 pt-0">
            <div className="grid grid-cols-8 gap-1">
              {filteredCommonEmojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
            {filteredCommonEmojis.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No emojis found
              </p>
            )}
          </TabsContent>

          <TabsContent value="custom" className="max-h-60 overflow-y-auto p-3 pt-0">
            <div className="grid grid-cols-6 gap-1">
              {filteredGuildEmojis.map((emoji) => (
                <Button
                  key={emoji.emoji_id}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 flex flex-col"
                  onClick={() => handleEmojiSelect(emoji.name, true, emoji)}
                  title={`:${emoji.name}:`}
                >
                  <img 
                    src={emoji.url} 
                    alt={emoji.name} 
                    className="w-6 h-6"
                    loading="lazy"
                  />
                </Button>
              ))}
            </div>
            {filteredGuildEmojis.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                {guildEmojis.length === 0 ? 'No custom emojis available' : 'No emojis found'}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}