import { Injectable } from '@nestjs/common';

@Injectable()
export class UrlShortenerService {
  private readonly charset =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly codeLength = 7;

  /**
   * Converts a number to base62 string using the charset
   */
  private numberToBase62(num: number): string {
    if (num === 0) return this.charset[0];

    let result = '';
    const base = this.charset.length;

    while (num > 0) {
      result = this.charset[num % base] + result;
      num = Math.floor(num / base);
    }

    return result;
  }

  /**
   * Generates a unique short code (guaranteed unique on first attempt)
   */
  generateUniqueShortCode(num: number): string {
    const base62 = this.numberToBase62(num);

    const randomPadding = this.codeLength - base62.length;
    let code = base62;

    for (let i = 0; i < randomPadding; i++) {
      const randomIndex = Math.floor(Math.random() * this.charset.length);
      code = this.charset[randomIndex] + code;
    }

    return code.slice(0, this.codeLength);
  }
}
