import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { UtilsService } from "src/_helpers/utils.service";
import { join } from 'path';
import * as Handlebars from 'handlebars';
import { ALLOWED_LANGUAGES } from 'src/common/constants/lang';
const path = require('path');

export class EmailUtils {
    constructor() { }

    /**
   * Internal method to save and open email locally
   * @param subject
   * @param context
   */
    public static async saveAndOpenEmailLocally(subject: string, context: Record<string, any>, template: string) {
        try {
            const dirPath = './local-emails';
            const filePath = `${dirPath}/${subject.replace(/\s/g, "")}.html`;
            const templateText = readFileSync(path.resolve(path.resolve(__dirname, '../../'), template), 'utf8');
            const compiledTemplate = Handlebars.compile(templateText);
            const renderedHtml = compiledTemplate(context);
            this.clearFolder(dirPath);
            writeFileSync(filePath, renderedHtml);
            UtilsService.openInBrowser(filePath);
        } catch (error) {
            console.error('Error saving or opening email locally:', error.message);
        }
    }
    /**
     * directory path to clear
     * @param dirPath 
     */
    public static clearFolder(dirPath: string) {
        if (existsSync(dirPath)) {
            const files = readdirSync(dirPath); // Get all files in the directory
            for (const file of files) {
                unlinkSync(join(dirPath, file)); // Delete each file
            }
        } else {
            mkdirSync(dirPath, { recursive: true }); // Create the directory if it doesn't exist
        }
    }

    public static getUserLanguage = (lang) => ALLOWED_LANGUAGES.includes(lang) ? lang : ALLOWED_LANGUAGES[0];
}
