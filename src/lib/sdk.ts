export interface User {
  id: string;
  username: string;
  avatar: string;
}

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  permissions: number;
  bot_installed: boolean;
}

export interface GuildUser {
  user_id: string;
  username: string;
  avatar: string;
}

export interface GuildRole {
  role_id: string;
  name: string;
  color: number;
  permissions: number;
  position: number;
}

export interface TextChannel {
  channel_id: string;
  category_id?: string;
  name: string;
  position: number;
  topic?: string;
  nsfw: boolean;
}

export interface GuildCategory {
  category_id: string;
  name: string;
  type: number;
  position: number;
  topic?: string;
  nsfw: boolean;
}

export interface GuildEmoji {
  emoji_id?: string; // Only for custom Discord emojis, not needed for unicode
  name: string;
  url?: string; // Optional, for display purposes only
  animated?: boolean;
}

export interface GuildSticker {
  sticker_id: string;
  name: string;
  url: string;
  description: string;
  emoji: string;
  format: number;
  available: boolean;
}

export interface GuildData {
  id: string;
  name: string;
  icon: string;
  banner: string;
  owner_id: string;
  premium_tier: number;
  premium_subscription_count: number;
  users: GuildUser[];
  roles: GuildRole[];
  emojis: GuildEmoji[];
  stickers: GuildSticker[];
  channels: TextChannel[];
  categories: GuildCategory[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GuildPreferences {
  id: string;
  command_prefix: string;
  language: string;
  timezone: string;
  embed_color: string;
  embed_footer: string;
  embed_footer_images: string[];
}

export interface MessageEmbed {
  title?: string;
  description?: string;
  color?: number;
  footer?: {
    text?: string;
    icon_url?: string;
  };
  author?: {
    name?: string;
    url?: string;
    icon_url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
  image?: string;
  thumbnail?: string;
  timestamp?: string;
  url?: string;
}


export interface ButtonComponent {
  custom_id: string;
  label: string;
  style: 1 | 2 | 3 | 4 | 5 | 6;
  emoji?: GuildEmoji;
  url?: string;
  disabled?: boolean;
}


export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: GuildEmoji;
  default: boolean;
}

export interface MenuComponent {
  custom_id: string;
  placeholder: string;
  min_values: number;
  max_values: number;
  options: SelectOption[];
  disabled?: boolean;
}


export interface DiscordMessage {
  content?: string;
  embeds?: MessageEmbed[];
  components?: (ButtonComponent | MenuComponent)[];
}

export interface WelcomeConfig {
  id: string;
  enabled: boolean;
  welcome_channel_id?: string;
  goodbye_channel_id?: string;
  dm_new_users: boolean;
  welcome_message?: DiscordMessage;
  goodbye_message?: DiscordMessage;
  dm_message?: DiscordMessage;
  auto_roles: string[];
}

export interface RoleReward {
  level: number;
  role_ids: string[];
  remove_previous: boolean;
  description?: string;
}

export interface LevelsConfig {
  id: string;
  enabled: boolean;
  announcement_type: 'current_channel' | 'specific_channel' | 'disabled';
  announcement_channel_id?: string;
  level_up_message?: DiscordMessage;
  xp_per_message: number;
  xp_cooldown_seconds: number;
  role_rewards: RoleReward[];
  xp_boosters: unknown[];
  channel_mode: 'whitelist' | 'blacklist';
  channel_list: string[];
}

export interface RssFeed {
  id?: string;
  guild_id: string;
  channel_id: string | null;
  url: string;
  name: string;
  enabled: boolean;
  message: string;
  last_updated?: string;
}

export interface ReactRoleAssignment {
  role_ids: string[];
  trigger_id: string;
}

export interface ReactRole {
  id?: string;
  guild_id: string;
  message_id: string;
  name: string;
  role_assignments: ReactRoleAssignment[];
  enabled: boolean;
  updated_at?: string;
}

export interface AiConfig {
  enabled: boolean;
  stream: boolean;
  engage_mode: boolean;
  engage_rate: number;
  memory_type: number;
  memory_limit: number;
  system_prompt: string;
  input_template: string;
  target_roles: string[];
  target_roles_mode: boolean;
  target_channels: string[];
  target_channels_mode: boolean;
  ai_moderation: boolean;
  reaction_responses: boolean;
}

export interface GuildMessage {
  id?: string;
  guild_id: string;
  channel_id: string;
  message_id?: string;
  name?: string;
  content?: string;
  embeds?: MessageEmbed[];
  components?: (ButtonComponent | MenuComponent)[];
  reactions?: GuildEmoji[];
  published: boolean;
  updated_at?: string;
}

import { getConfig } from './config';

// Use runtime config for API URLs (supports Docker runtime injection)
const getApiBaseUrl = () => getConfig().PLANA_API_URL;
const getFrontendUrl = () => getConfig().PLANA_SITE_URL;

export class AuthService {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  private static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }

  private static isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  private static extractUserFromToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id,
        username: payload.username,
        avatar: payload.avatar
      };
    } catch {
      return null;
    }
  }

  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${getApiBaseUrl()}/api${url}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        throw new Error('Authentication failed');
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    return response;
  }

  static async loginWithRedirect(): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/url`);
    if (!response.ok) throw new Error('Failed to get auth URL');
    
    const { url } = await response.json();
    window.location.href = url;
  }

  static async loginWithPopup(): Promise<AuthResponse> {
    if (!window.open) {
      throw new Error('Popup authentication not supported');
    }

    const response = await fetch(`${getApiBaseUrl()}/api/auth/url`);
    if (!response.ok) throw new Error('Failed to get auth URL');
    
    const { url } = await response.json();
    const popupUrl = new URL(url);
    popupUrl.searchParams.set('popup', 'true');

    return new Promise((resolve, reject) => {
      const popup = window.open(
        popupUrl.toString(),
        'discord-oauth',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Failed to open popup'));
        return;
      }

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== getFrontendUrl() && event.origin !== getApiBaseUrl()) return;
        if (!event.data?.type) return;

        if (event.data.type === 'DISCORD_OAUTH_SUCCESS') {
          const { token } = event.data;
          const user = this.extractUserFromToken(token);
          console.log('User extracted from token:', user);
          
          if (!token || !user) {
            reject(new Error('Invalid authentication response'));
            return;
          }

          this.setToken(token);
          resolve({ token, user });
        } else if (event.data.type === 'DISCORD_OAUTH_ERROR') {
          reject(new Error(event.data.error || 'Authentication failed'));
        }

        cleanup();
      };

      const cleanup = () => {
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) popup.close();
      };

      window.addEventListener('message', messageHandler);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          cleanup();
          reject(new Error('Popup closed'));
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkClosed);
        cleanup();
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth('/auth/me');
      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  }

  static async getUserGuilds(): Promise<Guild[]> {
    const response = await this.fetchWithAuth('/auth/guilds');
    const data = await response.json();
    return data.guilds;
  }

  static async getGuildData(guildId: string): Promise<GuildData> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/data`);
    return response.json();
  }

  static async getGuildPreferences(guildId: string): Promise<GuildPreferences> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/preferences`);
    return response.json();
  }

  static async updateGuildPreferences(guildId: string, preferences: Partial<GuildPreferences>): Promise<GuildPreferences> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    return response.json();
  }

  static async resetGuildPreferences(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/preferences`, {
      method: 'DELETE'
    });
  }

  // Welcome System API
  static async getWelcomeConfig(guildId: string): Promise<WelcomeConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/welcome`);
    return response.json();
  }

  static async updateWelcomeConfig(guildId: string, config: Partial<WelcomeConfig>): Promise<WelcomeConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/welcome`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  static async deleteWelcomeConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/welcome`, {
      method: 'DELETE'
    });
  }

  // Levels System API
  static async getLevelsConfig(guildId: string): Promise<LevelsConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/levels`);
    return response.json();
  }

  static async updateLevelsConfig(guildId: string, config: Partial<LevelsConfig>): Promise<LevelsConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/levels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  static async deleteLevelsConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/levels`, {
      method: 'DELETE'
    });
  }

  // RSS Feeds API
  static async getRssFeeds(guildId: string, limit: number = 50, offset: number = 0): Promise<{ data: RssFeed[], total_count: number }> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss?limit=${limit}&offset=${offset}`);
    return response.json();
  }

  static async createRssFeed(guildId: string, feed: Omit<RssFeed, 'id' | 'last_updated'>): Promise<RssFeed> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feed)
    });
    return response.json();
  }

  static async getRssFeed(guildId: string, feedId: string): Promise<RssFeed> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss/${feedId}`);
    return response.json();
  }

  static async updateRssFeed(guildId: string, feedId: string, feed: RssFeed): Promise<RssFeed> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss/${feedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feed)
    });
    return response.json();
  }

  static async deleteRssFeed(guildId: string, feedId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/rss/${feedId}`, {
      method: 'DELETE'
    });
  }

  // React Roles API
  static async getReactRoles(guildId: string): Promise<{ data: ReactRole[]; total_count: number }> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/react-roles`);
    return response.json();
  }

  static async createReactRole(guildId: string, reactRole: Omit<ReactRole, 'id' | 'updated_at'>): Promise<ReactRole> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/react-roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reactRole)
    });
    return response.json();
  }

  static async updateReactRole(guildId: string, reactRoleId: string, reactRole: Omit<ReactRole, 'id' | 'updated_at'>): Promise<ReactRole> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/react-roles/${reactRoleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reactRole)
    });
    return response.json();
  }

  static async deleteReactRole(guildId: string, reactRoleId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/react-roles/${reactRoleId}`, {
      method: 'DELETE'
    });
  }

  // Messages API
  static async getGuildMessages(guildId: string, limit = 50, offset = 0): Promise<{ data: GuildMessage[]; total: number }> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/messages?limit=${limit}&offset=${offset}`);
    return response.json();
  }

  static async createGuildMessage(guildId: string, message: Omit<GuildMessage, 'id' |  'updated_at'>): Promise<GuildMessage> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  static async updateGuildMessage(guildId: string, messageId: string, message: Partial<GuildMessage>): Promise<GuildMessage> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  static async deleteGuildMessage(guildId: string, messageId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  // AI Configuration API
  static async getAiConfig(guildId: string): Promise<AiConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/ai`);
    return response.json();
  }

  static async updateAiConfig(guildId: string, config: Partial<AiConfig>): Promise<AiConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/ai`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  static async deleteAiConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/ai`, {
      method: 'DELETE'
    });
  }

  static async logout(): Promise<void> {
    try {
      await this.fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors, just remove token
    }
    this.removeToken();
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    if (!this.isValidJWT(token)) {
      this.removeToken();
      return false;
    }
    
    return true;
  }
}

export function getDiscordAvatarUrl(user: User): string {
  if (!user.avatar) {
    const defaultAvatar = 0;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

export function getDiscordGuildIconUrl(guild: Guild): string {
  return guild.icon 
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    : '/default-guild-icon.png';
}

export function getDiscordGuildBannerUrl(guild: Guild): string | null {
  return guild.banner 
    ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png`
    : null;
}

export function getBotInviteUrl(guildId?: string): string {
  const baseUrl = 'https://discord.com/api/oauth2/authorize';
  const params = new URLSearchParams({
    client_id: getConfig().DISCORD_BOT_ID,
    permissions: '8',
    scope: 'bot applications.commands'
  });
  
  if (guildId) {
    params.append('guild_id', guildId);
  }
  
  return `${baseUrl}?${params.toString()}`;
} 