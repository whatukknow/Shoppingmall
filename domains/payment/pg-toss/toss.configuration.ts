/** NEW payment-window keys must belong to the same test/live environment. */
export function hasMatchingModernTossKeys(
  clientKey: string | undefined,
  secretKey: string | undefined,
): boolean {
  const clientMode = clientKey?.match(/^(test|live)_gck_.+$/)?.[1];
  const secretMode = secretKey?.match(/^(test|live)_gsk_.+$/)?.[1];
  return Boolean(clientMode && secretMode && clientMode === secretMode);
}
