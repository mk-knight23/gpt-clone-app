import { toast } from "@/hooks/use-toast";

export interface ProcessedFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'code' | 'other';
  size: number;
  content?: string;
  preview?: string;
  metadata?: {
    wordCount?: number;
    lineCount?: number;
    language?: string;
    dimensions?: { width: number; height: number };
    lastModified: Date;
  };
}

export class FileProcessor {
  private static instance: FileProcessor;
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  private supportedDocumentTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/json'];
  private supportedCodeTypes = [
    'text/javascript', 'text/typescript', 'text/jsx', 'text/tsx',
    'text/python', 'text/html', 'text/css', 'text/sql',
    'text/java', 'text/cpp', 'text/c', 'text/rust', 'text/go'
  ];

  static getInstance(): FileProcessor {
    if (!FileProcessor.instance) {
      FileProcessor.instance = new FileProcessor();
    }
    return FileProcessor.instance;
  }

  async processFile(file: File): Promise<ProcessedFile> {
    const processedFile: ProcessedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: this.getFileType(file),
      size: file.size,
      metadata: {
        lastModified: new Date(file.lastModified)
      }
    };

    try {
      // Process based on file type
      switch (processedFile.type) {
        case 'image':
          await this.processImage(file, processedFile);
          break;
        case 'document':
          await this.processDocument(file, processedFile);
          break;
        case 'code':
          await this.processCode(file, processedFile);
          break;
        default:
          await this.processGeneric(file, processedFile);
      }

      return processedFile;
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getFileType(file: File): ProcessedFile['type'] {
    if (this.supportedImageTypes.includes(file.type)) {
      return 'image';
    }
    if (this.supportedDocumentTypes.includes(file.type) || 
        file.name.match(/\.(pdf|txt|md|json)$/i)) {
      return 'document';
    }
    if (this.supportedCodeTypes.includes(file.type) ||
        file.name.match(/\.(js|ts|jsx|tsx|py|html|css|sql|java|cpp|c|rs|go)$/i)) {
      return 'code';
    }
    return 'other';
  }

  private async processImage(file: File, processedFile: ProcessedFile): Promise<void> {
    // Create preview
    processedFile.preview = await this.createImagePreview(file);
    
    // Get image dimensions
    const dimensions = await this.getImageDimensions(file);
    if (dimensions) {
      processedFile.metadata!.dimensions = dimensions;
    }

    // Analyze image (basic metadata)
    processedFile.metadata!.wordCount = 0; // Images don't have word count
  }

  private async processDocument(file: File, processedFile: ProcessedFile): Promise<void> {
    try {
      const content = await this.readFileAsText(file);
      processedFile.content = content;
      
      // Extract metadata
      processedFile.metadata!.wordCount = this.countWords(content);
      processedFile.metadata!.lineCount = content.split('\n').length;
      
      if (file.name.endsWith('.json')) {
        try {
          const jsonData = JSON.parse(content);
          processedFile.metadata!.wordCount = Object.keys(jsonData).length;
        } catch (e) {
          // Invalid JSON, continue with text processing
        }
      }
    } catch (error) {
      throw new Error(`Failed to read document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processCode(file: File, processedFile: ProcessedFile): Promise<void> {
    try {
      const content = await this.readFileAsText(file);
      processedFile.content = content;
      
      // Extract code metadata
      processedFile.metadata!.lineCount = content.split('\n').length;
      processedFile.metadata!.wordCount = this.countWords(content);
      processedFile.metadata!.language = this.detectProgrammingLanguage(file.name);
      
      // Basic code analysis
      const analysis = this.analyzeCode(content, processedFile.metadata!.language!);
      processedFile.metadata = { ...processedFile.metadata, ...analysis };
    } catch (error) {
      throw new Error(`Failed to read code file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processGeneric(file: File, processedFile: ProcessedFile): Promise<void> {
    // For unsupported file types, just create basic metadata
    processedFile.metadata!.wordCount = 0;
    processedFile.metadata!.lineCount = 0;
  }

  private async createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to create image preview'));
      reader.readAsDataURL(file);
    });
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private detectProgrammingLanguage(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'jsx': 'React JSX',
      'tsx': 'React TSX',
      'py': 'Python',
      'html': 'HTML',
      'css': 'CSS',
      'sql': 'SQL',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'rs': 'Rust',
      'go': 'Go',
      'php': 'PHP',
      'rb': 'Ruby',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'scala': 'Scala',
      'r': 'R',
      'm': 'MATLAB'
    };
    return languageMap[extension || ''] || 'Unknown';
  }

  private analyzeCode(code: string, language: string): Record<string, any> {
    const lines = code.split('\n');
    const analysis: Record<string, any> = {
      totalLines: lines.length,
      commentLines: 0,
      blankLines: 0,
      codeLines: 0
    };

    // Basic code analysis based on language
    switch (language) {
      case 'JavaScript':
      case 'TypeScript':
        analysis.functions = (code.match(/function\s+\w+|const\s+\w+\s*=|=>\s*{/g) || []).length;
        analysis.classes = (code.match(/class\s+\w+/g) || []).length;
        break;
      case 'Python':
        analysis.functions = (code.match(/def\s+\w+/g) || []).length;
        analysis.classes = (code.match(/class\s+\w+/g) || []).length;
        analysis.imports = (code.match(/^import\s+|^from\s+/gm) || []).length;
        break;
      case 'Java':
      case 'C++':
      case 'C':
        analysis.functions = (code.match(/\w+\s+\w+\s*\([^)]*\)\s*{/g) || []).length;
        analysis.classes = (code.match(/class\s+\w+/g) || []).length;
        break;
    }

    // Count line types
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '') {
        analysis.blankLines++;
      } else if (this.isCommentLine(trimmed, language)) {
        analysis.commentLines++;
      } else {
        analysis.codeLines++;
      }
    });

    return analysis;
  }

  private isCommentLine(line: string, language: string): boolean {
    const commentPatterns: Record<string, RegExp> = {
      'JavaScript': /^\s*\/\//,
      'TypeScript': /^\s*\/\//,
      'Python': /^\s*#/,
      'Java': /^\s*\/\//,
      'C++': /^\s*\/\//,
      'C': /^\s*\/\//,
      'CSS': /^\s*\/\//,
      'HTML': /^\s*<!--/
    };

    const pattern = commentPatterns[language];
    return pattern ? pattern.test(line) : false;
  }

  // Utility methods for validation
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.maxFileSize)})`
      };
    }

    const supportedTypes = [
      ...this.supportedImageTypes,
      ...this.supportedDocumentTypes,
      ...this.supportedCodeTypes
    ];

    if (!supportedTypes.includes(file.type) && !this.isCodeFile(file.name)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not supported`
      };
    }

    return { valid: true };
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css', '.sql', '.java', '.cpp', '.c', '.rs', '.go'];
    return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // AI Integration for file analysis
  async analyzeFileForAI(file: ProcessedFile): Promise<string> {
    let analysis = `File: ${file.name}\n`;
    analysis += `Type: ${file.type}\n`;
    analysis += `Size: ${this.formatFileSize(file.size)}\n`;
    
    if (file.metadata) {
      analysis += `Metadata:\n`;
      if (file.metadata.wordCount !== undefined) {
        analysis += `- Word count: ${file.metadata.wordCount}\n`;
      }
      if (file.metadata.lineCount !== undefined) {
        analysis += `- Line count: ${file.metadata.lineCount}\n`;
      }
      if (file.metadata.language) {
        analysis += `- Language: ${file.metadata.language}\n`;
      }
      if (file.metadata.dimensions) {
        analysis += `- Dimensions: ${file.metadata.dimensions.width}x${file.metadata.dimensions.height}\n`;
      }
    }

    if (file.content) {
      analysis += `\nContent preview:\n`;
      analysis += file.content.substring(0, 500) + (file.content.length > 500 ? '...' : '');
    }

    return analysis;
  }
}

export const fileProcessor = FileProcessor.getInstance();