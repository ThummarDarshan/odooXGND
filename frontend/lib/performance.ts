// Performance monitoring utility
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  startTimer(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    this.metrics.delete(name);
    return metric.duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    return fn().finally(() => {
      this.endTimer(name);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

import React from 'react';

// React hook for measuring component render times
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    performanceMonitor.startTimer(`${componentName}-render`);
    return () => {
      performanceMonitor.endTimer(`${componentName}-render`);
    };
  });
}
