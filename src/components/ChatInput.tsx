import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  SendIcon,
  MicIcon,
  StopCircleIcon,
  PaperclipIcon,
  ImageIcon,
  FileTextIcon,
  XIcon,
  SmileIcon,
  CodeIcon,
  SparklesIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileAttachment {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'code' | 'other';
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  onFileUpload?: (files: File[]) => void;
  maxFileSize?: number;
  supportedFormats?: string[];
}

export function ChatInput({
  onSendMessage,
  isLoading,
  onStopGeneration,
  onFileUpload,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  supportedFormats = ['image/*', '.pdf', '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css']
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleSend = useCallback(() => {
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
      setUploadProgress(0);
    }
  }, [message, attachments, isLoading, onSendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const processFiles = useCallback(async (files: FileList) => {
    const newAttachments: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        continue;
      }

      // Determine file type
      let type: FileAttachment['type'] = 'other';
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type === 'application/pdf' || file.type.includes('text/') || file.name.endsWith('.md')) {
        type = 'document';
      } else if (file.name.match(/\.(js|ts|jsx|tsx|py|html|css|json)$/)) {
        type = 'code';
      }

      const attachment: FileAttachment = {
        id: `att-${Date.now()}-${i}`,
        file,
        type
      };

      // Generate preview for images
      if (type === 'image') {
        try {
          const preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          attachment.preview = preview;
        } catch (error) {
          console.error('Error generating preview:', error);
        }
      }

      newAttachments.push(attachment);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    
    if (onFileUpload) {
      onFileUpload(Array.from(files));
    }
  }, [maxFileSize, onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    dragCounter.current = 0;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const getFileIcon = (type: FileAttachment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'document': return <FileTextIcon className="w-4 h-4" />;
      case 'code': return <CodeIcon className="w-4 h-4" />;
      default: return <PaperclipIcon className="w-4 h-4" />;
    }
  };

  const commonEmojis = ['😊', '👍', '❤️', '😂', '🤔', '🎉', '🔥', '💡'];

  return (
    <div className={cn(
      "border-t border-border/30 glass-card transition-all duration-300",
      isDragOver && "border-primary border-2 border-dashed bg-primary/5"
    )}>
      <div className="max-w-4xl mx-auto p-4">
        {/* File Attachments */}
        {attachments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 animate-fade-in">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative group glass-card p-2 rounded-lg flex items-center space-x-2 animate-scale-in"
              >
                {attachment.preview ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    {getFileIcon(attachment.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{attachment.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(attachment.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4 animate-fade-in">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Uploading files...</p>
          </div>
        )}

        <div className="relative flex items-end space-x-3">
          {/* File Upload Button */}
          <Button
            size="icon"
            variant="ghost"
            className="flex-shrink-0 w-10 h-10 rounded-full glass-hover"
            onClick={() => fileInputRef.current?.click()}
          >
            <PaperclipIcon className="w-4 h-4" />
          </Button>

          {/* Voice Recording Button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full transition-all duration-300",
              isRecording && "bg-destructive text-destructive-foreground animate-pulse"
            )}
            onClick={() => setIsRecording(!isRecording)}
          >
            <MicIcon className="w-4 h-4" />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              placeholder="Message CHUTES AI... (Drop files here or use @ for mentions)"
              className={cn(
                "min-h-[44px] max-h-32 resize-none input-glass pr-20",
                "focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-muted-foreground/70",
                isDragOver && "border-primary border-2 border-dashed"
              )}
              disabled={isLoading}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {/* Emoji Button */}
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 rounded-full glass-hover"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <SmileIcon className="w-3 h-3" />
              </Button>

              {/* Send/Stop Button */}
              {isLoading ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 rounded-full hover:bg-destructive/10 glass-hover"
                  onClick={onStopGeneration}
                >
                  <StopCircleIcon className="w-4 h-4 text-destructive" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-300",
                    message.trim() || attachments.length > 0
                      ? "btn-primary hover:scale-105"
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                  onClick={handleSend}
                  disabled={!message.trim() && attachments.length === 0}
                >
                  <SendIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mt-3 p-3 glass-card rounded-lg animate-scale-in">
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-lg hover:bg-muted/50"
                  onClick={() => {
                    setMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Helper Text */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Enter to send • Shift+Enter for new line</span>
            <span>•</span>
            <span>Drag & drop files</span>
          </div>
          
          {attachments.length > 0 && (
            <div className="flex items-center space-x-1 text-primary">
              <SparklesIcon className="w-3 h-3" />
              <span>{attachments.length} file{attachments.length !== 1 ? 's' : ''} attached</span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}