import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, DollarSign, TrendingUp, Music, Star, Users, Zap, Heart } from "lucide-react";
import { getBotInviteUrl } from "@/lib/sdk";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-8">
            <Image
              src="/plana.png"
              alt="Project Plana"
              width={120}
              height={120}
              className="rounded-full shadow-lg"
              priority
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Project Plana
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A powerful, free, and open-source Discord bot inspired by Blue Archive. 
            Enhance your server with advanced moderation, economy, and entertainment features.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" asChild className="text-lg px-8">
              <a 
                href={getBotInviteUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Users className="mr-2 h-5 w-5" />
                Invite Bot
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/dashboard">
                <Zap className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              <Star className="mr-1 h-3 w-3" />
              Free Forever
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Heart className="mr-1 h-3 w-3" />
              Open Source
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Shield className="mr-1 h-3 w-3" />
              Trusted by 1000+ Servers
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for your Discord server
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Project Plana offers a comprehensive suite of features designed to enhance 
              your Discord community experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Moderation</CardTitle>
                <CardDescription>
                  Advanced moderation tools with auto-mod, custom rules, and detailed logging
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Economy</CardTitle>
                <CardDescription>
                  Virtual currency system with games, rewards, and customizable shops
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Leveling</CardTitle>
                <CardDescription>
                  XP and level system with role rewards and leaderboards
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full w-fit">
                  <Music className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Music</CardTitle>
                <CardDescription>
                  High-quality music player with queue management and playlists
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why choose Project Plana?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built with love for the Discord community, inspired by Blue Archive
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-background rounded-full w-fit shadow-sm">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Forever</h3>
              <p className="text-muted-foreground">
                No premium features, no paywalls. All features are completely free to use.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-background rounded-full w-fit shadow-sm">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Open Source</h3>
              <p className="text-muted-foreground">
                Transparent development, community-driven features, and full customization.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-background rounded-full w-fit shadow-sm">
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
              <p className="text-muted-foreground">
                Get started in minutes with our intuitive dashboard and configuration tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to enhance your Discord server?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of servers already using Project Plana to create amazing communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <a 
                href={getBotInviteUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Users className="mr-2 h-5 w-5" />
                Invite Bot Now
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/wiki">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
