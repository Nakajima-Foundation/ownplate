function isFunctionCalled(functionName: string): Boolean {
  return (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName);
}

export default function exportIfNeeded(functionName: string, fileName: string, exports: any): void {
  if (isFunctionCalled(functionName)) {
    exports[functionName] = require(`../wrappers/${fileName}`).default;
  }
}
