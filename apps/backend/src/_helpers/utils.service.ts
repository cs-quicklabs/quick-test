import * as bcrypt from "bcrypt";
import * as _ from "lodash";
import { InternalServerErrorException } from "@nestjs/common";
import { ErrorMessages } from "../common/enums/error-messages";
import { exec } from 'child_process';

export class UtilsService {
  /**
   * convert entity to dto class instance
   * @param {{new(entity: E, options: any): T}} model
   * @param {E[] | E} entity
   * @param options
   * @returns {T[] | T}
   */
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E,
    options?: any,
  ): T;

  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E[],
    options?: any,
  ): T[];

  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E | E[],
    options?: any,
  ): T | T[] {
    if (_.isArray(entity)) {
      return entity.map((u) => new model(u, options));
    }

    return new model(entity, options);
  }

  /**
   * generate hash from password or string
   * @param {string} password
   * @returns {string}
   */
  static generateHash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * generate random string
   * @param length
   */
  static generateRandomString(length: number): string {
    const str =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const strLength = str.length;
    const res = [];
    for (let i = 0; i <= length; i++) {
      const randomChar = str[Math.floor(Math.random() * strLength)];
      res.push(randomChar);
    }
    return res.join("");
  }
  /**
   * validate text with hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */

  static validateHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash || "");
  }

  /**
   * Searches for a given substring
   */
  public static contains(
    str: string,
    substring: string,
    fromIndex: number,
  ): boolean {
    return str.indexOf(substring, fromIndex) !== -1;
  }

  /**
   * "Safer" String.toLowerCase()
   */
  public static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  /**
   * "Safer" String.toUpperCase()
   */
  public static upperCase(str: string): string {
    return str.toUpperCase();
  }

  /**
   * UPPERCASE first char of each word.
   */
  public static properCase(str: string): string {
    return this.lowerCase(str).replace(/^\w|\s\w/g, this.upperCase);
  }

  /**
   * UPPERCASE first char of each sentence and lowercase other chars.
   */
  public static sentenceCase(str: string): string {
    // Replace first char of each sentence (new line or after '.\s+') to Uppercase
    return this.lowerCase(str).replace(/(^\w)|\.\s+(\w)/gm, this.upperCase);
  }

  /**
   * Generate random Int.
   */
  public static randomInt(min = 1000, max = 9999): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static titleCase(str: string): string {
    return str.replace(str[0], str[0].toUpperCase());
  }

  /**
   * Check if string is uuid
   */
  public static checkUuid(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Get past date by days as time frame
   */
  public static getPastDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  /**
   * Check leap year
   */
  public static checkLeapYear(year: number): boolean {
    if (year % 4 === 0 && year % 100 === 0 && year % 400 === 0) {
      return true;
    }
    if (year % 4 === 0 && year % 100 !== 0) {
      return true;
    }
    return false;
  }

  /**
   * Remove delimiter from string
   */
  public static removeDelimiter(input: string, separator: string): string {
    return input.split(separator).join();
  }

  /**
   * callback function for throwing error
   */
  public static handleError(_error) {
    throw new InternalServerErrorException(ErrorMessages.INTERNAL_SERVER);
  }

  /**
   * create an uploadable pdf file
   */
  public static createUploadableFile(pdfName, pdfCommonConfig, readableStream) {
    return {
      fieldName: pdfName,
      mimetype: pdfCommonConfig.mimeType,
      buffer: readableStream,
      originalname: pdfName,
      encoding: pdfCommonConfig.encodingType,
    };
  }

  public static openInBrowser(filePath: string) {
    const normalizedPath = filePath.replace(/\\/g, '/'); // Normalize for different OS
    const platform = process.platform;
    let command: string;
    if (platform === 'win32') {
      // Windows
      command = `start ${normalizedPath}`;
    } else if (platform === 'darwin') {
      // macOS
      command = `open ${normalizedPath}`;
    } else {
      // Linux
      command = `xdg-open ${normalizedPath}`;
    }
    exec(command, (error) => {
      if (error) {
        console.error('Error opening file in browser:', error.message);
      } else {
        console.log('Email opened in browser:', normalizedPath);
      }
    });
  }

  public static getFileLocation(bucket: string, endpoint: string, key: string) {
    if (bucket && endpoint && key) return `https://${bucket}.${endpoint}/${key}`
    else return null;
  }

}


