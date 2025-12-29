'use client';

import React from 'react';
import { Check, ChevronDown, X, Shield } from 'lucide-react';
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
import { GuildRole } from '@/lib/sdk';

interface RoleMultiSelectProps {
  roles: GuildRole[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSelection?: number;
  showColors?: boolean;
}

// Convert decimal color to hex
function decimalToHex(decimal: number): string {
  if (decimal === 0) return '#99AAB5'; // Default Discord role color
  return `#${decimal.toString(16).padStart(6, '0')}`;
}

// Check if color is light (for text contrast)
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

export function RoleMultiSelect({
  roles,
  value = [],
  onValueChange,
  placeholder = "Select roles",
  disabled = false,
  className,
  maxSelection,
  showColors = true
}: RoleMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Sort roles by position (higher position = higher in hierarchy)
  const sortedRoles = React.useMemo(() => {
    return [...(roles || [])].sort((a, b) => b.position - a.position);
  }, [roles]);

  const selectedRoles = React.useMemo(() => {
    return (value || []).map(roleId => (roles || []).find(role => role.role_id === roleId)).filter(Boolean) as GuildRole[];
  }, [value, roles]);

  const handleSelect = (roleId: string) => {
    const newValue = value.includes(roleId)
      ? value.filter(id => id !== roleId)
      : maxSelection && value.length >= maxSelection
        ? value
        : [...value, roleId];
    
    onValueChange(newValue);
  };

  const removeRole = (roleId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange(value.filter(id => id !== roleId));
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
            className={cn("justify-between min-h-10", className)}
            disabled={disabled}
          >
            {selectedRoles.length > 0 ? (
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
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
            <CommandInput placeholder="Search roles..." />
            <CommandList>
              <CommandEmpty>No roles found.</CommandEmpty>
              
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

              <CommandGroup heading="Available Roles">
                                 {sortedRoles.map((role) => {
                   const isSelected = value.includes(role.role_id);
                   const isMaxReached = maxSelection && !isSelected && value.length >= maxSelection;
                   const roleColor = showColors ? decimalToHex(role.color) : undefined;
                   
                   return (
                     <CommandItem
                       key={role.role_id}
                       value={role.role_id}
                       onSelect={() => !isMaxReached && handleSelect(role.role_id)}
                       disabled={!!isMaxReached}
                       className={cn(
                         "flex items-center gap-2",
                         isMaxReached && "opacity-50 cursor-not-allowed"
                       )}
                     >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Shield 
                        className="h-4 w-4"
                        style={{ color: roleColor }}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate">{role.name}</span>
                        {showColors && role.color !== 0 && (
                          <div 
                            className="w-3 h-3 rounded-full border border-border shrink-0"
                            style={{ backgroundColor: roleColor }}
                          />
                        )}
                      </div>
                      {isMaxReached && (
                        <span className="text-xs text-muted-foreground">Max reached</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected roles display */}
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md min-h-[2.5rem]">
          {selectedRoles.map((role) => {
            const roleColor = showColors ? decimalToHex(role.color) : undefined;
            const isLight = roleColor ? isLightColor(roleColor) : false;
            
            return (
              <Badge
                key={role.role_id}
                variant="secondary"
                className={cn(
                  "flex items-center gap-1 pr-1",
                  showColors && role.color !== 0 && "border"
                )}
                style={
                  showColors && role.color !== 0
                    ? {
                        backgroundColor: roleColor,
                        color: isLight ? '#000000' : '#ffffff',
                        borderColor: roleColor,
                      }
                    : undefined
                }
              >
                <Shield className="h-3 w-3" />
                <span className="text-xs truncate max-w-[100px]">{role.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-4 w-4 p-0 hover:bg-black/10",
                    showColors && role.color !== 0 && isLight && "hover:bg-black/20"
                  )}
                                     onClick={(e) => removeRole(role.role_id, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
      
      {maxSelection && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxSelection} roles selected
        </p>
      )}
    </div>
  );
} 