'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface ItemListAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface ItemListItem {
  id: string | number;
  title: string;
  subtitle?: string | React.ReactNode;
  status?: string;
  statusVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  content: React.ReactNode;
  actions?: ItemListAction[];
  isExpanded?: boolean;
}

interface ItemListProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: ItemListItem[];
  onAddItem?: () => void;
  onSaveAll?: () => void;
  addItemLabel?: string;
  saveAllLabel?: string;
  loading?: boolean;
  className?: string;
  showSaveAll?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onToggleExpand?: (itemId: string | number) => void;
  collapsible?: boolean;
}

export function ItemList({
  title,
  description,
  icon: Icon,
  items,
  onAddItem,
  onSaveAll,
  addItemLabel = 'Add Item',
  saveAllLabel = 'Save All Changes',
  loading = false,
  className,
  showSaveAll = true,
  emptyMessage = 'No items found',
  emptyDescription = 'Get started by creating your first item.',
  onToggleExpand,
  collapsible = true
}: ItemListProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              <div>
                <CardTitle>{title}</CardTitle>
                {description && (
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onAddItem && (
                <Button onClick={onAddItem} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {addItemLabel}
                </Button>
              )}
              {showSaveAll && onSaveAll && items.length > 0 && (
                <Button onClick={onSaveAll} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveAllLabel}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {items.length > 0 && (
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              {collapsible && onToggleExpand && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => items.forEach(item => onToggleExpand(item.id))}
                  >
                    Expand All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              onToggleExpand={onToggleExpand}
              collapsible={collapsible}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground space-y-2">
              {Icon && <Icon className="h-8 w-8 mx-auto opacity-50" />}
              <div>
                <p className="font-medium">{emptyMessage}</p>
                <p className="text-sm">{emptyDescription}</p>
              </div>
              {onAddItem && (
                <Button onClick={onAddItem} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  {addItemLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ItemCardProps {
  item: ItemListItem;
  index: number;
  onToggleExpand?: (itemId: string | number) => void;
  collapsible: boolean;
}

function ItemCard({ item, index, onToggleExpand, collapsible }: ItemCardProps) {
  const [isOpen, setIsOpen] = React.useState(item.isExpanded ?? true);

  React.useEffect(() => {
    if (item.isExpanded !== undefined) {
      setIsOpen(item.isExpanded);
    }
  }, [item.isExpanded]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggleExpand?.(item.id);
  };

  if (!collapsible) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{index + 1}</Badge>
              <div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                {item.subtitle && (
                  <CardDescription className="text-sm mt-1">
                    {item.subtitle}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.status && (
                <Badge variant={item.statusVariant || 'default'}>
                  {item.status}
                </Badge>
              )}
              {item.actions?.map((action, actionIndex) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={actionIndex}
                    variant={action.variant || 'ghost'}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4 mr-1" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>{item.content}</CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  {item.subtitle && (
                    <CardDescription className="text-sm mt-1">
                      {item.subtitle}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {item.status && (
                  <Badge variant={item.statusVariant || 'default'}>
                    {item.status}
                  </Badge>
                )}
                {item.actions?.map((action, actionIndex) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={actionIndex}
                      variant={action.variant || 'ghost'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!action.disabled) {
                          action.onClick();
                        }
                      }}
                      disabled={action.disabled}
                    >
                      {ActionIcon && <ActionIcon className="h-4 w-4 mr-1" />}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{item.content}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
} 