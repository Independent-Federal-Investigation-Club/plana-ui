import Link from 'next/link';
import { Github, Twitter, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold">Project Plana</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              A powerful and free Discord bot inspired by Blue Archive. 
              Open source and community-driven.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features/moderation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Moderation
                </Link>
              </li>
              <li>
                <Link href="/features/economy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Economy
                </Link>
              </li>
              <li>
                <Link href="/features/leveling" className="text-muted-foreground hover:text-foreground transition-colors">
                  Leveling
                </Link>
              </li>
              <li>
                <Link href="/features/music" className="text-muted-foreground hover:text-foreground transition-colors">
                  Music
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/wiki" className="text-muted-foreground hover:text-foreground transition-colors">
                  Wiki
                </Link>
              </li>
              <li>
                <Link href="/commands" className="text-muted-foreground hover:text-foreground transition-colors">
                  Commands
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://discord.gg/plana" 
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord Server
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/project-plana" 
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                  <Github className="h-3 w-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/projectplana" 
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                  <Twitter className="h-3 w-3 flex-shrink-0" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © 2024 Project Plana. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 