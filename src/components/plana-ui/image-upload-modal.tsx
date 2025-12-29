'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadModalProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  trigger: React.ReactNode;
  title?: string;
  guildId: string;
  disabled?: boolean;
}

export function ImageUploadModal({
  value,
  onValueChange,
  trigger,
  title = "Upload Image",
  guildId,
  disabled = false
}: ImageUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlValue, setUrlValue] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No authentication token');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_PLANA_API_URL || 'http://localhost:8000'}/api/guilds/${guildId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onValueChange(url);
      setUrlValue(url);
      toast.success('Image uploaded successfully');
      setOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  }, []);

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onValueChange(urlValue.trim());
      setOpen(false);
    } else {
      onValueChange(undefined);
      setOpen(false);
    }
  };

  const clearImage = () => {
    onValueChange(undefined);
    setUrlValue('');
    setOpen(false);
  };

  // Render current image preview with proper aspect ratio
  const renderCurrentImagePreview = () => {
    if (!value) return null;

    return (
      <div className="flex justify-center mb-4">
        <div className="relative max-w-md">
          <div className="bg-muted rounded border overflow-hidden">
            <img
              src={value}
              alt="Current image"
              className="w-full h-auto object-contain"
              style={{ maxHeight: '200px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDMuNUgzQzIuNzIgMy41IDIuNSAzLjcyIDIuNSA0VjIwQzIuNSAyMC4yOCAyLjcyIDIwLjUgMyAyMC41SDIxQzIxLjI4IDIwLjUgMjEuNSAyMC4yOCAyMS41IDIwVjRDMjEuNSAzLjcyIDIxLjI4IDMuNSAyMSAzLjVaTTIwIDEzLjVMMTYuNSAxMEwxMy4wMSAxMy40OUw5LjUgOS45OUw0IDEzVjVIMjBWMTMuNVoiIGZpbGw9IiM5ZjlmOWYiLz4KPC9zdmc+';
              }}
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Upload an image file or enter a URL
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {renderCurrentImagePreview()}

            {/* Drag and Drop Area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                uploading && "opacity-50 pointer-events-none"
              )}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {uploading ? 'Uploading...' : 'Drag and drop your image here'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse files
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Supports JPG, PNG, GIF, and WebP files (max 10MB)
            </p>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            {renderCurrentImagePreview()}

            <div className="space-y-3">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.png"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUrlSubmit}>
                  {urlValue.trim() ? 'Set Image' : 'Clear Image'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
} 