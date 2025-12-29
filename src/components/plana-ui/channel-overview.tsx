'use client';

import React from 'react';
import { Hash, Volume2, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TextChannel, GuildCategory } from '@/lib/sdk';

interface ChannelOverviewProps {
  channels: TextChannel[];
  categories: GuildCategory[];
  className?: string;
}

interface ChannelNode {
  type: 'category' | 'channel';
  data: GuildCategory | TextChannel;
  children?: ChannelNode[];
}

export function ChannelOverview({
  channels,
  categories,
  className
}: ChannelOverviewProps) {
  // Build hierarchical structure
  const channelTree = React.useMemo(() => {
    const tree: ChannelNode[] = [];
    const categoryMap = new Map<string, ChannelNode>();
    
    // Sort categories by position
    const sortedCategories = [...categories].sort((a, b) => a.position - b.position);
    
    // Create category nodes
    sortedCategories.forEach(category => {
      const node: ChannelNode = {
        type: 'category',
        data: category,
        children: []
      };
      categoryMap.set(category.category_id, node);
      tree.push(node);
    });
    
    // Sort channels by position within each category
    const sortedChannels = [...channels].sort((a, b) => a.position - b.position);
    
    // Add channels to their categories or as top-level if no category
    sortedChannels.forEach(channel => {
      const channelNode: ChannelNode = {
        type: 'channel',
        data: channel
      };
      
      if (channel.category_id && categoryMap.has(channel.category_id)) {
        categoryMap.get(channel.category_id)!.children!.push(channelNode);
      } else {
        // Channel without category - add to top level
        tree.push(channelNode);
      }
    });
    
    return tree;
  }, [channels, categories]);

  const getChannelIcon = (channel: TextChannel) => {
    // Note: API doesn't provide channel type, so we assume text channels
    // In a real implementation, you'd check channel.type
    return <Hash className="h-4 w-4 text-muted-foreground" />;
  };

  const renderChannelNode = (node: ChannelNode, depth: number = 0): React.ReactNode => {
    if (node.type === 'category') {
      const category = node.data as GuildCategory;
      return (
        <div key={category.category_id} className="space-y-1">
          <div className={cn("flex items-center gap-2 py-1", depth > 0 && "ml-4")}>
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm uppercase text-muted-foreground">
              {category.name}
            </span>
            {category.nsfw && (
              <Badge variant="destructive" className="text-xs h-5">
                NSFW
              </Badge>
            )}
          </div>
          {category.topic && (
            <p className={cn("text-xs text-muted-foreground mb-2", depth > 0 ? "ml-6" : "ml-6")}>
              {category.topic}
            </p>
          )}
          <div className="space-y-1">
            {node.children?.map(child => renderChannelNode(child, depth + 1))}
          </div>
        </div>
      );
    } else {
      const channel = node.data as TextChannel;
      return (
        <div 
          key={channel.channel_id} 
          className={cn("flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2 -mx-2", depth > 0 && "ml-4")}
        >
          {getChannelIcon(channel)}
          <span className="text-sm">{channel.name}</span>
          {channel.nsfw && (
            <Badge variant="destructive" className="text-xs h-5">
              NSFW
            </Badge>
          )}
          {channel.topic && (
            <span className="text-xs text-muted-foreground truncate flex-1 ml-2">
              {channel.topic}
            </span>
          )}
        </div>
      );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Server Structure
        </CardTitle>
        <CardDescription>
          Overview of all channels and categories in this server
        </CardDescription>
      </CardHeader>
      <CardContent>
        {channelTree.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {channelTree.map(node => renderChannelNode(node))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No channels or categories found</p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{categories.length} categories</span>
            <span>{channels.length} channels</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 