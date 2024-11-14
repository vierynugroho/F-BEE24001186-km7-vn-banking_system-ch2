import nodemailer from 'nodemailer';
import { ErrorHandler } from '../middlewares/error.js';

const APP_EMAIL = process.env.APP_EMAIL;
const APP_PASS = process.env.APP_PASS;

export class EmailService {
  static async send(to, subject, html) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: APP_EMAIL,
        pass: APP_PASS,
      },
    });

    await transport.sendMail({ to, subject, html });
  }

  static async getTemplate(fileName, data) {
    try {
      const path = `${__dirname}/../views/templates/${fileName}`;
      const html = await ejs.renderFile(path, data);
      return html;
    } catch (error) {
      throw new ErrorHandler(500, error.message);
    }
  }
}
