function isFunctionCalled(functionName: string): boolean {
  return !process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName;
}

export default function exportIfNeeded(functionName: string, fileName: string, exports: Record<string, unknown>): void {
  if (isFunctionCalled(functionName)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    exports[functionName] = require(`../wrappers/${fileName}`).default;
  }
}
