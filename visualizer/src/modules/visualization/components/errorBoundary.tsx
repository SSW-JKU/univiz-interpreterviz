import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { i: number }
> {
  state = { i: 0 };

  static errorKey = 1;

  static getDerivedStateFromError(error: any) {
    console.error(error);
    return { i: ErrorBoundary.errorKey++ };
  }

  render() {
    return this.props.children;
  }
}
