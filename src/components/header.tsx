'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { getDiscordAvatarUrl } from '@/lib/sdk';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  const { user, login, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/plana.png"
              alt="Project Plana"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-lg sm:text-xl font-bold truncate">Project Plana</span>
          </Link>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm">Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px] md:w-[500px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Moderation</h4>
                        <p className="text-sm text-muted-foreground">
                          Advanced moderation tools with customizable rules
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Economy</h4>
                        <p className="text-sm text-muted-foreground">
                          Virtual currency system with games and rewards
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Leveling</h4>
                        <p className="text-sm text-muted-foreground">
                          XP and level system with custom rewards
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Music</h4>
                        <p className="text-sm text-muted-foreground">
                          High-quality music player with queue management
                        </p>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/wiki" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  Wiki
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/dashboard" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  Dashboard
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <ThemeToggle />
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getDiscordAvatarUrl(user)} alt={user.username} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium truncate">{user.username}</p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={login} className="flex items-center gap-2 text-sm px-3 sm:px-4">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span className="hidden sm:inline">Login with Discord</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/wiki"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wiki
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Features</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">Moderation</p>
                    <p className="text-xs text-muted-foreground">Advanced tools</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Economy</p>
                    <p className="text-xs text-muted-foreground">Virtual currency</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Leveling</p>
                    <p className="text-xs text-muted-foreground">XP system</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Music</p>
                    <p className="text-xs text-muted-foreground">Music player</p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 