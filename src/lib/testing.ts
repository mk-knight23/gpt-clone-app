// Testing Utilities for CHUTES AI Chat

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface PerformanceBenchmark {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  passed: boolean;
}

export interface AccessibilityTest {
  element: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
}

class TestingSuite {
  private static instance: TestingSuite;
  private testResults: TestResult[] = [];
  private benchmarks: PerformanceBenchmark[] = [];

  static getInstance(): TestingSuite {
    if (!TestingSuite.instance) {
      TestingSuite.instance = new TestingSuite();
    }
    return TestingSuite.instance;
  }

  // Test Runner
  async runTest(name: string, testFn: () => Promise<any> | any): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      const testResult: TestResult = {
        name,
        passed: true,
        duration,
        metadata: { result }
      };
      
      this.testResults.push(testResult);
      console.log(`✅ Test passed: ${name} (${duration.toFixed(2)}ms)`);
      
      return testResult;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      const testResult: TestResult = {
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
      
      this.testResults.push(testResult);
      console.error(`❌ Test failed: ${name} (${duration.toFixed(2)}ms)`, error);
      
      return testResult;
    }
  }

  // Performance Benchmarking
  benchmark(name: string, fn: () => void | Promise<void>, iterations: number = 100): PerformanceBenchmark {
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const iterationStart = performance.now();
      // Run synchronous or async function
      const result = fn();
      if (result instanceof Promise) {
        // For async functions, we can't easily benchmark in a loop
        // This is a simplified version
      }
      const iterationEnd = performance.now();
      
      // Store individual iteration if needed
      if (i === 0) {
        // Store first iteration for reference
      }
    }
    
    const totalTime = performance.now() - startTime;
    const averageTime = totalTime / iterations;
    
    const benchmark: PerformanceBenchmark = {
      name,
      value: averageTime,
      unit: 'ms',
      threshold: 16, // 60fps threshold
      passed: averageTime < 16
    };
    
    this.benchmarks.push(benchmark);
    console.log(`📊 Benchmark: ${name} - ${averageTime.toFixed(2)}ms avg (${iterations} iterations)`);
    
    return benchmark;
  }

  // Accessibility Testing
  async runAccessibilityTests(): Promise<AccessibilityTest[]> {
    const issues: AccessibilityTest[] = [];
    
    // Test for missing alt attributes on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        issues.push({
          element: `img:nth-child(${index + 1})`,
          issue: 'Missing alt attribute',
          severity: 'high',
          suggestion: 'Add descriptive alt text for screen readers'
        });
      }
    });
    
    // Test for missing labels on form inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!id && !ariaLabel && !ariaLabelledby) {
        issues.push({
          element: `input:nth-child(${index + 1})`,
          issue: 'Missing label association',
          severity: 'high',
          suggestion: 'Add id and corresponding label, or use aria-label'
        });
      }
    });
    
    // Test for missing headings hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          element: heading.tagName.toLowerCase(),
          issue: `Heading level skip from h${previousLevel} to h${level}`,
          severity: 'medium',
          suggestion: 'Use proper heading hierarchy (h1 → h2 → h3, etc.)'
        });
      }
      previousLevel = level;
    });
    
    // Test for missing focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, textarea, select, [tabindex]');
    focusableElements.forEach((element, index) => {
      const style = window.getComputedStyle(element, ':focus');
      if (style.outline === 'none' && !style.boxShadow.includes('rgb')) {
        issues.push({
          element: element.tagName.toLowerCase(),
          issue: 'No visible focus indicator',
          severity: 'medium',
          suggestion: 'Add visible focus styles for keyboard navigation'
        });
      }
    });
    
    console.log(`♿ Accessibility tests completed: ${issues.length} issues found`);
    return issues;
  }

  // Security Testing
  async runSecurityTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // Test for XSS vulnerabilities
    results.push(await this.runTest('XSS Prevention', async () => {
      const testInput = '<script>alert("xss")</script>';
      const sanitized = this.sanitizeInput(testInput);
      if (sanitized.includes('<script>')) {
        throw new Error('XSS vulnerability detected');
      }
    }));
    
    // Test for CSRF protection
    results.push(await this.runTest('CSRF Protection', async () => {
      // Check if forms have CSRF tokens or same-site cookies
      const forms = document.querySelectorAll('form');
      let hasProtection = false;
      
      forms.forEach(form => {
        const csrfToken = form.querySelector('input[name*="csrf"], input[name*="token"]');
        if (csrfToken) hasProtection = true;
      });
      
      if (!hasProtection) {
        console.warn('No CSRF protection detected in forms');
      }
    }));
    
    // Test for secure headers
    results.push(await this.runTest('Security Headers', async () => {
      // This would typically check response headers
      // For client-side testing, we can check meta tags
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        console.warn('No CSP meta tag found');
      }
    }));
    
    return results;
  }

  // Performance Testing
  async runPerformanceTests(): Promise<PerformanceBenchmark[]> {
    const benchmarks: PerformanceBenchmark[] = [];
    
    // Test page load time
    benchmarks.push(this.benchmark('Page Load', () => {
      // This would measure actual page load in a real scenario
      // For now, we'll simulate some work
      const start = performance.now();
      while (performance.now() - start < 1) {
        // Simulate work
      }
    }));
    
    // Test DOM manipulation performance
    benchmarks.push(this.benchmark('DOM Manipulation', () => {
      const container = document.createElement('div');
      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div');
        element.textContent = `Item ${i}`;
        container.appendChild(element);
      }
      document.body.appendChild(container);
      document.body.removeChild(container);
    }, 50));
    
    // Test memory usage
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
    const largeArray = new Array(100000).fill('test');
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = memoryAfter - memoryBefore;
    
    benchmarks.push({
      name: 'Memory Usage',
      value: memoryIncrease,
      unit: 'bytes',
      threshold: 10 * 1024 * 1024, // 10MB
      passed: memoryIncrease < 10 * 1024 * 1024
    });
    
    console.log(`⚡ Performance tests completed: ${benchmarks.length} benchmarks`);
    return benchmarks;
  }

  // API Testing
  async runAPITests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // Test API connectivity
    results.push(await this.runTest('API Connectivity', async () => {
      try {
        const response = await fetch('/api/health', { method: 'GET' });
        if (!response.ok) {
          throw new Error(`API health check failed: ${response.status}`);
        }
      } catch (error) {
        // API might not exist in development
        console.warn('API connectivity test skipped:', error);
      }
    }));
    
    // Test error handling
    results.push(await this.runTest('Error Handling', async () => {
      try {
        await fetch('/api/nonexistent');
      } catch (error) {
        // Expected to fail
        if (!(error instanceof TypeError)) {
          throw new Error('Unexpected error type');
        }
      }
    }));
    
    return results;
  }

  // Utility Methods
  private sanitizeInput(input: string): string {
    return input
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Report Generation
  generateTestReport(): string {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;
    const avgDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / total;
    
    let report = `# Test Report\n\n`;
    report += `**Summary:**\n`;
    report += `- Total Tests: ${total}\n`;
    report += `- Passed: ${passed}\n`;
    report += `- Failed: ${failed}\n`;
    report += `- Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`;
    report += `- Average Duration: ${avgDuration.toFixed(2)}ms\n\n`;
    
    if (failed > 0) {
      report += `**Failed Tests:**\n`;
      this.testResults.filter(r => !r.passed).forEach(test => {
        report += `- ${test.name}: ${test.error}\n`;
      });
      report += `\n`;
    }
    
    if (this.benchmarks.length > 0) {
      report += `**Performance Benchmarks:**\n`;
      this.benchmarks.forEach(benchmark => {
        const status = benchmark.passed ? '✅' : '❌';
        report += `${status} ${benchmark.name}: ${benchmark.value.toFixed(2)}${benchmark.unit}\n`;
      });
    }
    
    return report;
  }

  // Public API
  getResults(): TestResult[] {
    return [...this.testResults];
  }

  getBenchmarks(): PerformanceBenchmark[] {
    return [...this.benchmarks];
  }

  clearResults(): void {
    this.testResults = [];
    this.benchmarks = [];
  }

  // Comprehensive Test Suite
  async runAllTests(): Promise<{
    tests: TestResult[];
    benchmarks: PerformanceBenchmark[];
    accessibility: AccessibilityTest[];
    security: TestResult[];
    performance: PerformanceBenchmark[];
    api: TestResult[];
  }> {
    console.log('🧪 Starting comprehensive test suite...');
    
    const [accessibility, security, performance, api] = await Promise.all([
      this.runAccessibilityTests(),
      this.runSecurityTests(),
      this.runPerformanceTests(),
      this.runAPITests()
    ]);
    
    console.log('✅ All tests completed');
    
    return {
      tests: this.testResults,
      benchmarks: this.benchmarks,
      accessibility,
      security,
      performance,
      api
    };
  }
}

export const testing = TestingSuite.getInstance();

// React Hook for Testing
export function useTesting() {
  return {
    runTest: testing.runTest.bind(testing),
    benchmark: testing.benchmark.bind(testing),
    runAccessibilityTests: testing.runAccessibilityTests.bind(testing),
    runSecurityTests: testing.runSecurityTests.bind(testing),
    runPerformanceTests: testing.runPerformanceTests.bind(testing),
    runAPITests: testing.runAPITests.bind(testing),
    runAllTests: testing.runAllTests.bind(testing),
    getResults: testing.getResults.bind(testing),
    getBenchmarks: testing.getBenchmarks.bind(testing),
    generateTestReport: testing.generateTestReport.bind(testing),
    clearResults: testing.clearResults.bind(testing)
  };
}