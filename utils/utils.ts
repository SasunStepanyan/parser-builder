import { Transform, TransformCallback } from 'stream';

export class ParserTransform extends Transform {
  constructor(private readonly prefix: string) {
    super();
  }
  public _transform(chunk: any, encoding: string, callback: TransformCallback) {
    let text = chunk.toString();
    const regexp = new RegExp(` ?${this.prefix}-\\w* ?| class=" ?${this.prefix}-\\w* ?"`, 'gi');
    text = text.replace(regexp, '');
    this.push(text);
    callback();
  }
}
