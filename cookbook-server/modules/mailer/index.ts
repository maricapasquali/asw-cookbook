import * as nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'

import * as dotenv from 'dotenv'
import {TemplateEmail} from "./templates";
dotenv.config({path: path.join(__dirname, ".env")})

export interface MessageHeader {
   from?: string
   to: string
   subject: string
   attachments?: []
}

export type MailerOptions = {
   test ?: boolean,
   savedJSON ?: { filename: string },
   callbacks ?: { error: (e: any) => void, success: (i: object) => void }
}

export interface IMailer {
   send(messageHeader: MessageHeader, templateEmail: TemplateEmail, options?: MailerOptions)
}

export class Mailer implements IMailer {
   private readonly transport: any
   private readonly from: string

   private readonly output;

   constructor(from: string, output?: string) {
      this.from = from
      this.transport = nodemailer.createTransport({
         host: process.env.MAILER_HOST,
         port: process.env.MAILER_PORT,
         auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASSWORD
         }
      });
      this.output = output || path.join(__dirname , 'outputs')
   }

   send(messageHeader: MessageHeader, templateEmail: TemplateEmail, options?: MailerOptions) {
      const callbacks = options.callbacks
      const savedJSON = options.savedJSON
      const test = options.test

      try {
         const _messageHeader = Object.assign({ from: this.from }, messageHeader)
         const message = {..._messageHeader, html: templateEmail.toHtml(), text: templateEmail.toText() }

         if(!test){
            this.transport.sendMail(message, function (err, info){
               if(err) {
                  console.error(err)
                  if(callbacks && typeof callbacks.error === 'function') callbacks.error(err)
               }
               else {
                  console.debug('Email was sent to '+ messageHeader.to)
                  if(callbacks && typeof callbacks.success === 'function') callbacks.success(info)
               }
            })
         }

         if(savedJSON){
            let templateEmailJSON = templateEmail.toJson()
            let pathFileJSON: string = path.join(this.output, savedJSON.filename + ".json")
            fs.writeFile(pathFileJSON, JSON.stringify({..._messageHeader, ...templateEmailJSON}), 'utf8', (err)=> {
               if(err) console.error(err)
               else console.debug('Save email in '+ pathFileJSON)
            });
         }

      }catch (e){
         console.error(e)
         if(callbacks && typeof callbacks.error === 'function') callbacks.error(e)
      }
   }

}

