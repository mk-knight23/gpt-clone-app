import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  BotIcon,
  UserIcon,
  CopyIcon,
  EditIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShareIcon,
  MoreHorizontalIcon,
  CheckIcon,
  XIcon,
  SparklesIcon,
  CodeIcon,
  ImageIcon,
  FileTextIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  messageId?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onReact?: (messageId: string, reaction: 'like' | 'dislike') => void;
  onShare?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
  isStreaming?: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'document' | 'code' | 'other';
    url?: string;
    name: string;
    size?: number;
  }>;
}

export function ChatMessage({
  message,
  isUser,
  timestamp,
  messageId,
  onEdit,
  onReact,
  onShare,
  onCopy,
  isStreaming = false,
  attachments = []
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message);
  const [showActions, setShowActions] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy && messageId) {
      onCopy(messageId);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleSaveEdit = () => {
    if (onEdit && messageId && editContent.trim() !== message) {
      onEdit(messageId, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    setReaction(type);
    if (onReact && messageId) {
      onReact(messageId, type);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[80px] resize-none input-glass"
            placeholder="Edit your message..."
          />
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={handleSaveEdit} className="btn-primary">
              <CheckIcon className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              <XIcon className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Message Text */}
        <div className={cn(
          "prose prose-sm max-w-none",
          isUser ? "prose-invert" : "prose-invert"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
            )}
          </p>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="glass-card p-3 rounded-lg flex items-center space-x-3"
              >
                {attachment.type === 'image' && attachment.url ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    {attachment.type === 'image' && <ImageIcon className="w-5 h-5" />}
                    {attachment.type === 'document' && <FileTextIcon className="w-5 h-5" />}
                    {attachment.type === 'code' && <CodeIcon className="w-5 h-5" />}
                    {attachment.type === 'other' && <FileTextIcon className="w-5 h-5" />}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  {attachment.size && (
                    <p className="text-xs text-muted-foreground">
                      {(attachment.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Auto-focus edit textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  return (
    <div
      className={cn(
        "group flex w-full py-6 px-4 animate-slide-in-up",
        isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex max-w-[85%] space-x-4">
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
              <BotIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        
        <div className="flex-1 space-y-3">
          {/* Message Bubble */}
          <div
            className={cn(
              "chat-message relative",
              isUser ? "user" : "assistant"
            )}
          >
            {renderMessageContent()}
            
            {/* Message Actions */}
            <div className={cn(
              "message-actions",
              showActions && "opacity-100"
            )}>
              <span className="text-xs text-muted-foreground/70">
                {formatTimestamp(timestamp)}
              </span>
              
              <div className="flex items-center space-x-1">
                {/* Copy Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="action-btn"
                  onClick={handleCopy}
                >
                  <CopyIcon className="w-3 h-3" />
                  {copied && <span className="ml-1 text-xs">Copied!</span>}
                </Button>

                {/* Reaction Buttons */}
                {!isUser && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "action-btn",
                        reaction === 'like' && "text-green-400"
                      )}
                      onClick={() => handleReaction('like')}
                    >
                      <ThumbsUpIcon className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "action-btn",
                        reaction === 'dislike' && "text-red-400"
                      )}
                      onClick={() => handleReaction('dislike')}
                    >
                      <ThumbsDownIcon className="w-3 h-3" />
                    </Button>
                  </>
                )}

                {/* Edit Button (User only) */}
                {isUser && onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="action-btn"
                    onClick={handleEdit}
                  >
                    <EditIcon className="w-3 h-3" />
                  </Button>
                )}

                {/* More Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="action-btn"
                    >
                      <MoreHorizontalIcon className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card">
                    {onShare && (
                      <DropdownMenuItem onClick={() => onShare(messageId!)}>
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleCopy}>
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    {!isUser && (
                      <DropdownMenuItem>
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Regenerate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <UserIcon className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}