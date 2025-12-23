import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  FileTextIcon,
  HeartIcon,
  LaughIcon,
  AngryIcon,
  FrownIcon,
  FlameIcon,
  StarIcon,
  ZapIcon,
  BookmarkIcon,
  FlagIcon,
  ReplyIcon,
  PinIcon,
  TrashIcon,
  RefreshCwIcon,
  Volume2Icon,
  VolumeXIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  messageId?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onReact?: (messageId: string, reaction: 'like' | 'dislike' | string) => void;
  onShare?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onBookmark?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  isStreaming?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  reactions?: Record<string, number>;
  userReaction?: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'document' | 'code' | 'other';
    url?: string;
    name: string;
    size?: number;
  }>;
  model?: string;
  tokens?: number;
  processingTime?: number;
}

// Custom components for ReactMarkdown
const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (!inline && language) {
      return (
        <div className="relative group my-4">
          <div className="flex items-center justify-between bg-muted/30 px-4 py-2 rounded-t-lg border border-border/50">
            <Badge variant="outline" className="text-xs">
              {language}
            </Badge>
          </div>
          <pre className="bg-muted/20 p-4 rounded-b-lg overflow-x-auto">
            <code className="text-sm" {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <code className={cn(
        "bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono",
        className
      )} {...props}>
        {children}
      </code>
    );
  },

  a({ children, href, ...props }: any) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
        {...props}
      >
        {children}
        <ExternalLinkIcon className="w-3 h-3" />
      </a>
    );
  },

  blockquote({ children, ...props }: any) {
    return (
      <blockquote
        className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/20 rounded-r-lg italic"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
};

export const EnhancedChatMessage = ({
  message,
  isUser,
  timestamp,
  messageId,
  onEdit,
  onReact,
  onShare,
  onCopy,
  onReply,
  onBookmark,
  onPin,
  onDelete,
  onRegenerate,
  isStreaming = false,
  isBookmarked = false,
  isPinned = false,
  reactions = {},
  userReaction,
  attachments = [],
  model,
  tokens,
  processingTime
}: EnhancedChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message);
  const [showActions, setShowActions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

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
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[80px] resize-none"
            placeholder="Edit your message..."
          />
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={handleSaveEdit}>
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

    const shouldCollapse = message.length > 1000 && !isExpanded;

    return (
      <div className="space-y-4">
        {/* Message Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isUser && model && (
              <Badge variant="outline" className="text-xs">
                {model}
              </Badge>
            )}
            {tokens && (
              <Badge variant="secondary" className="text-xs">
                {tokens} tokens
              </Badge>
            )}
            {processingTime && (
              <Badge variant="secondary" className="text-xs">
                {processingTime}ms
              </Badge>
            )}
          </div>

          {message.length > 1000 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="w-3 h-3 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-3 h-3 mr-1" />
                  Expand
                </>
              )}
            </Button>
          )}
        </div>

        {/* Message Text */}
        <div className={cn(
          "prose prose-sm max-w-none",
          isUser ? "prose-invert" : "prose-invert",
          shouldCollapse && "max-h-32 overflow-hidden relative"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {shouldCollapse ? message.substring(0, 1000) + '...' : message}
          </ReactMarkdown>

          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="p-3 rounded-lg flex items-center space-x-3 border border-border/50"
              >
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  {attachment.type === 'document' && <FileTextIcon className="w-5 h-5" />}
                  {attachment.type === 'code' && <CodeIcon className="w-5 h-5" />}
                  {attachment.type === 'image' && <img src={attachment.url} alt={attachment.name} className="w-5 h-5 rounded" />}
                  {attachment.type === 'other' && <FileTextIcon className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  {attachment.size && (
                    <p className="text-xs text-muted-foreground">
                      {(attachment.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>

                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <DownloadIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "group flex w-full py-6 px-4",
        isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex max-w-[85%] space-x-4">
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <BotIcon className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        )}

        <div className="flex-1 space-y-3">
          {/* Message Bubble */}
          <div
            className={cn(
              "relative",
              isUser ? "user" : "assistant",
              isPinned && "ring-2 ring-primary/50"
            )}
          >
            {renderMessageContent()}

            {/* Pinned Indicator */}
            {isPinned && (
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <PinIcon className="w-2 h-2 text-primary-foreground" />
              </div>
            )}

            {/* Message Actions */}
            <div className={cn(
              "flex items-center justify-between mt-3",
              showActions ? "opacity-100" : "opacity-0"
            )}>
              <span className="text-xs text-muted-foreground/70">
                {formatTimestamp(timestamp)}
              </span>

              <div className="flex items-center space-x-1">
                {/* Copy Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleCopy}
                >
                  <CopyIcon className="w-3 h-3" />
                  {copied && <span className="ml-1 text-xs">Copied!</span>}
                </Button>

                {/* Quick Actions */}
                {!isUser && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 p-0",
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
                        "h-8 w-8 p-0",
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
                    className="h-8 w-8 p-0"
                    onClick={handleEdit}
                  >
                    <EditIcon className="w-3 h-3" />
                  </Button>
                )}
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
};
