export interface Service<TInput = unknown, TResult = unknown> {
  execute(input: TInput): Promise<TResult>;
}
