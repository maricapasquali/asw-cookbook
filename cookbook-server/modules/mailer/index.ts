import * as nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'

import * as dotenv from 'dotenv'
dotenv.config({path: path.resolve(__dirname, ".env")})

export interface IMailer {
   send(messageHeader: MessageHeader, callbacks?: {error: (e: any) => void, success: (i: object) => void})
   save(filename: string, content, callback?: (err) => void)
}

export interface MessageHeader {
   from?: string
   to: string
   subject: string
   html: string
   text?: string
   attachments?: []
}

export class Mailer implements IMailer{
   private readonly transport: any
   private readonly from: string

   private readonly output;

   constructor(from: string, output?: string ) {
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

   send(messageHeader: MessageHeader, callbacks?: {error: (e: any) => void, success: (i: object) => void}){
     try {
        const message = Object.assign({from: this.from}, messageHeader)
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
     }catch (e){
        console.error(e)
        if(callbacks && typeof callbacks.error === 'function') callbacks.error(e)
     }
   }

   save(filename: string, content, callback?: (err) => void) {
      fs.writeFile(path.join(this.output , filename), content, callback? callback: (e)=> {
         if(e) console.error(e.message)
         else console.debug('Save email in '+ this.output)
      });
   }
}

