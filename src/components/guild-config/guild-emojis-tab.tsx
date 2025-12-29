'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthService, GuildData, GuildEmoji } from '@/lib/sdk';
import { Smile, Image, Search, Copy, ExternalLink, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface GuildEmojisTabProps {
  guildId: string;
}

export function GuildEmojisTab({ guildId }: GuildEmojisTabProps) {
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        const data = await AuthService.getGuildData(guildId);
        setGuildData(data);
      } catch {
        toast.error('Failed to load guild data');
      } finally {
        setLoading(false);
      }
    };

    fetchGuildData();
  }, [guildId]);

  const copyEmojiId = (emoji: GuildEmoji) => {
    const emojiString = emoji.animated ? `<a:${emoji.name}:${emoji.emoji_id}>` : `<:${emoji.name}:${emoji.emoji_id}>`;
    navigator.clipboard.writeText(emojiString);
    toast.success(`Copied emoji: ${emojiString}`);
  };

  const copyEmojiUrl = (emoji: GuildEmoji) => {
    if (!emoji.url) return;
    navigator.clipboard.writeText(emoji.url);
    toast.success('Emoji URL copied to clipboard');
  };

  const filteredEmojis = guildData?.emojis.filter(emoji =>
    emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredStickers = guildData?.stickers.filter(sticker =>
    sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sticker.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading emojis and stickers...</p>
      </div>
    );
  }

  if (!guildData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load guild data.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Smile className="h-6 w-6" />
          Emojis & Stickers
        </h2>
        <p className="text-muted-foreground">
          View and manage your server's custom emojis and stickers
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emojis and stickers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="emojis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emojis" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Emojis ({filteredEmojis.length})
          </TabsTrigger>
          <TabsTrigger value="stickers" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Stickers ({filteredStickers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emojis">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smile className="h-5 w-5" />
                    Custom Emojis
                  </CardTitle>
                  <CardDescription>
                    All custom emojis available in this server
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {guildData.emojis.length} total emojis
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEmojis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmojis.map((emoji) => (
                    <div key={emoji.emoji_id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={emoji.url}
                          alt={`${emoji.name} emoji`}
                          className="w-8 h-8"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{emoji.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {emoji.emoji_id}
                          </div>
                        </div>
                        {emoji.animated && (
                          <Badge variant="secondary" className="text-xs">
                            Animated
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyEmojiId(emoji)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy ID
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyEmojiUrl(emoji)}
                          className="flex-1"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {searchTerm ? (
                    <>
                      <Smile className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No emojis found</h3>
                      <p className="text-sm text-muted-foreground">
                                                 No emojis match your search term &quot;{searchTerm}&quot;
                      </p>
                    </>
                  ) : (
                    <>
                      <Smile className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No custom emojis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This server doesn&apos;t have any custom emojis yet
                      </p>
                      <Button variant="outline" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Emoji (Coming Soon)
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stickers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Custom Stickers
                  </CardTitle>
                  <CardDescription>
                    All custom stickers available in this server
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {guildData.stickers.length} total stickers
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredStickers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStickers.map((sticker) => (
                    <div key={sticker.sticker_id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={sticker.url}
                          alt={`${sticker.name} sticker`}
                          className="w-12 h-12 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{sticker.name}</div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {sticker.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {sticker.sticker_id}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {sticker.emoji}
                          </Badge>
                          <Badge 
                            variant={sticker.available ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {sticker.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(sticker.url);
                            toast.success('Sticker URL copied to clipboard');
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {searchTerm ? (
                    <>
                      <Image className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No stickers found</h3>
                      <p className="text-sm text-muted-foreground">
                                                 No stickers match your search term &quot;{searchTerm}&quot;
                      </p>
                    </>
                  ) : (
                    <>
                      <Image className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No custom stickers</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This server doesn&apos;t have any custom stickers yet
                      </p>
                      <Button variant="outline" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Sticker (Coming Soon)
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 