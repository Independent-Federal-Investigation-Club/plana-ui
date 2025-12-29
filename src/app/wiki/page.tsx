import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { BookOpen, Command, Settings, Users, DollarSign, Music, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Wiki() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Project Plana Wiki</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete documentation for Project Plana Discord bot. Learn how to set up and use all features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Quick setup guide for new users
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how to invite Project Plana to your server and configure basic settings.
              </p>
              <Button variant="outline" className="w-full">
                Read Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Command className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Commands</CardTitle>
                  <CardDescription>
                    Complete list of bot commands
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse all available commands organized by category with usage examples.
              </p>
              <Button variant="outline" className="w-full">
                View Commands
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>
                    Advanced configuration options
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Detailed guide on customizing bot behavior and appearance.
              </p>
              <Button variant="outline" className="w-full">
                Configuration Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle>Support</CardTitle>
                  <CardDescription>
                    Get help and report issues
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Join our community Discord or report bugs on GitHub.
              </p>
              <Button variant="outline" className="w-full">
                Get Support
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Moderation</h3>
              <p className="text-sm text-muted-foreground">
                Auto-moderation, warnings, bans, and logging
              </p>
            </Card>
            
            <Card className="text-center p-4">
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Economy</h3>
              <p className="text-sm text-muted-foreground">
                Virtual currency, shops, and mini-games
              </p>
            </Card>
            
            <Card className="text-center p-4">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Leveling</h3>
              <p className="text-sm text-muted-foreground">
                XP system with role rewards
              </p>
            </Card>
            
            <Card className="text-center p-4">
              <Music className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Music</h3>
              <p className="text-sm text-muted-foreground">
                High-quality music streaming
              </p>
            </Card>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
                      <p className="text-muted-foreground mb-6">
              Can&apos;t find what you&apos;re looking for? Our community is here to help!
            </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="https://discord.gg/9845afkhWT" target="_blank" rel="noopener noreferrer">
                Join Discord Server
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 