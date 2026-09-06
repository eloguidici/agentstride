export const ENTERPRISE_SUPPORT = "ENTERPRISE_SUPPORT";

export type EnterpriseSupportBundle = {
  receptionist: unknown;
  runReceptionist: (
    receptionist: any,
    input: string,
    runOptions?: Record<string, unknown>,
  ) => Promise<{
    id: string;
    status: string;
    text: string;
    output?: unknown;
    steps: number;
    durationMs: number;
  }>;
};

export class EnterpriseSupportService {
  constructor(private readonly bundle: EnterpriseSupportBundle) {}

  run(
    input: string,
    options: {
      context: Record<string, unknown>;
      signal?: AbortSignal;
    },
  ) {
    return this.bundle.runReceptionist(this.bundle.receptionist, input, {
      context: options.context,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }
}
