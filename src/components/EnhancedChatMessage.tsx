/**
 * Enhanced Chat Message Component for CHUTES AI Chat v3.0
 *
 * Features:
 * - Advanced Markdown rendering with syntax highlighting
 * - LaTeX mathematical expressions
 * - Code blocks with copy functionality
 * - Image preview and gallery
 * - Message reactions and interactions
 * - Neo-Glass styling with micro-interactions
 * - Accessibility improvements
 * - Voice output integration
 */

import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSettingsStore } from "@/lib/store";

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
  onVoiceOutput?: (messageId: string) => void;
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
        <CodeBlock
          language={language}
          value={String(children).replace(/\n$/, '')}
          {...props}
        />
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

  // Enhanced link component
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

  // Enhanced blockquote
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

  // Enhanced table
  table({ children, ...props }: any) {
    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-border rounded-lg overflow-hidden" {...props}>
          {children}
        </table>
      </div>
    );
  },

  th({ children, ...props }: any) {
    return (
      <th className="bg-muted/50 px-4 py-2 text-left font-semibold border-b border-border" {...props}>
        {children}
      </th>
    );
  },

  td({ children, ...props }: any) {
    return (
      <td className="px-4 py-2 border-b border-border/50" {...props}>
        {children}
      </td>
    );
  },
};

// Code block component with copy functionality
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 rounded-t-lg border border-border/50">
        <Badge variant="outline" className="text-xs">
          {language}
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <CheckIcon className="w-3 h-3 text-green-500" />
          ) : (
            <CopyIcon className="w-3 h-3" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        className="rounded-b-lg !mt-0"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

// Image gallery component
function ImageGallery({ attachments }: { attachments: EnhancedChatMessageProps['attachments'] }) {
  const images = attachments?.filter(att => att.type === 'image') || [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 my-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer neo-glass-card overflow-hidden"
            onClick={() => setSelectedImage(image.url || '')}
          >
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-32 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ExternalLinkIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export const EnhancedChatMessage = memo(({
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
  onVoiceOutput,
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
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const settings = useSettingsStore();

  // Emoji reactions
  const emojiReactions = [
    { emoji: '❤️', name: 'love', icon: HeartIcon, color: 'text-red-500' },
    { emoji: '😂', name: 'laugh', icon: LaughIcon, color: 'text-yellow-500' },
    { emoji: '😮', name: 'surprise', icon: FlameIcon, color: 'text-orange-500' },
    { emoji: '😢', name: 'sad', icon: FrownIcon, color: 'text-blue-500' },
    { emoji: '😡', name: 'angry', icon: AngryIcon, color: 'text-red-600' },
    { emoji: '🔥', name: 'fire', icon: FlameIcon, color: 'text-orange-600' },
    { emoji: '⭐', name: 'star', icon: StarIcon, color: 'text-yellow-400' },
    { emoji: '⚡', name: 'zap', icon: ZapIcon, color: 'text-yellow-300' }
  ];

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

  const handleVoiceOutput = () => {
    if (onVoiceOutput && messageId) {
      setIsSpeaking(!isSpeaking);
      onVoiceOutput(messageId);
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
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeHighlight, rehypeKatex]}
            components={MarkdownComponents}
          >
            {shouldCollapse ? message.substring(0, 1000) + '...' : message}
          </ReactMarkdown>

          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
          )}
        </div>

        {/* Image Gallery */}
        <ImageGallery attachments={attachments} />

        {/* Other Attachments */}
        {attachments.filter(att => att.type !== 'image').length > 0 && (
          <div className="space-y-2">
            {attachments.filter(att => att.type !== 'image').map((attachment) => (
              <div
                key={attachment.id}
                className="neo-glass-card p-3 rounded-lg flex items-center space-x-3 interactive-element"
              >
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  {attachment.type === 'document' && <FileTextIcon className="w-5 h-5" />}
                  {attachment.type === 'code' && <CodeIcon className="w-5 h-5" />}
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
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
              <BotIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        <div className="flex-1 space-y-3">
          {/* Message Bubble */}
          <div
            className={cn(
              "enhanced-chat-message relative",
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

            {/* Emoji Reactions Bar */}
            {!isUser && Object.keys(reactions).length > 0 && (
              <div className="flex items-center space-x-1 mt-2 mb-1">
                {Object.entries(reactions).map(([emoji, count]) => (
                  <TooltipProvider key={emoji}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "h-6 px-2 text-xs rounded-full neo-glass hover:bg-primary/10",
                            userReaction === emoji && "bg-primary/20 text-primary"
                          )}
                          onClick={() => onReact && messageId && onReact(messageId, emoji)}
                        >
                          <span className="mr-1">{emoji}</span>
                          <span>{count}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>React with {emoji}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}

            {/* Message Actions */}
            <div className={cn(
              "message-actions",
              showActions && "opacity-100"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/70">
                  {formatTimestamp(timestamp)}
                </span>

                {/* Voice Output Button */}
                {settings.voice.voiceOutput && !isUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleVoiceOutput}
                    className={cn(
                      "action-btn ml-2",
                      isSpeaking && "text-primary"
                    )}
                  >
                    {isSpeaking ? (
                      <VolumeXIcon className="w-3 h-3" />
                    ) : (
                      <Volume2Icon className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {/* Emoji Reaction Button */}
                {!isUser && (
                  <Popover open={showReactions} onOpenChange={setShowReactions}>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="action-btn"
                      >
                        <span className="text-sm">😊</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <div className="flex space-x-1">
                        {emojiReactions.map((reaction) => (
                          <TooltipProvider key={reaction.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-muted/50"
                                  onClick={() => {
                                    if (onReact && messageId) {
                                      onReact(messageId, reaction.emoji);
                                    }
                                    setShowReactions(false);
                                  }}
                                >
                                  <span className="text-lg">{reaction.emoji}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>React with {reaction.emoji}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Copy Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="action-btn"
                        onClick={handleCopy}
                      >
                        <CopyIcon className="w-3 h-3" />
                        {copied && <span className="ml-1 text-xs">Copied!</span>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Quick Actions */}
                {!isUser && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Like this response</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dislike this response</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}

                {/* Edit Button (User only) */}
                {isUser && onEdit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="action-btn"
                          onClick={handleEdit}
                        >
                          <EditIcon className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Enhanced Quick Actions Menu */}
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
                  <DropdownMenuContent align="end" className="neo-glass-card">
                    {/* Primary Actions */}
                    {onReply && (
                      <DropdownMenuItem onClick={() => onReply(messageId!)}>
                        <ReplyIcon className="w-4 h-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                    )}

                    {onBookmark && (
                      <DropdownMenuItem onClick={() => onBookmark(messageId!)}>
                        <BookmarkIcon className={cn("w-4 h-4 mr-2", isBookmarked && "fill-current")} />
                        {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                      </DropdownMenuItem>
                    )}

                    {onPin && (
                      <DropdownMenuItem onClick={() => onPin(messageId!)}>
                        <PinIcon className={cn("w-4 h-4 mr-2", isPinned && "fill-current")} />
                        {isPinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Content Actions */}
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

                    {!isUser && onRegenerate && (
                      <DropdownMenuItem onClick={() => onRegenerate(messageId!)}>
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        Regenerate
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Destructive Actions */}
                    {onDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(messageId!)}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}

                    {!isUser && (
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <FlagIcon className="w-4 h-4 mr-2" />
                        Report
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
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg glow-primary">
              <UserIcon className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

EnhancedChatMessage.displayName = 'EnhancedChatMessage';
