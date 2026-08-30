export abstract class Presigner {
  abstract presignPut(key: string, contentType: string): Promise<string>;
  abstract publicUrl(key: string): string;
}
