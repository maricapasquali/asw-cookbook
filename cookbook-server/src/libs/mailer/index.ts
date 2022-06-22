import * as nodemailer from "nodemailer"
import * as fs from "fs"
import * as path from "path"

import * as dotenv from "dotenv"
import { TemplateEmail } from "./templates"

dotenv.config({ path: path.join(__dirname, ".env") })

/**
 * {@link MessageHeader} is an interface that represents the information of email (i.e sender, receiver, subject, attachments).
 */
export interface MessageHeader {
   /**
    * (Optional) Sender of email
    */
   from?: string
   /**
    * Receiver of email
    */
   to: string
   /**
    * Subject of email
    */
   subject: string
   /**
    * (Optional) Attachments list of email
    */
   attachments?: []
}

export type MailerOptions = {
   /**
    * (Optional) Field that if true does not send the email.
    * Note: Using only for testing.
    */
   test?: boolean
   /**
    * (Optional) Field for saving the information of the email in a file.
    * Note: Using only for testing.
    */
   savedJSON?: {
      /**
       * File name to save some information of email.
       */
      filename: string
   }
   /**
    * (Optional) Some callbacks for errors or success.
    */
   callbacks?: {
      /**
       * Function will be called when an error is raised.
       * @param e error
       */
      error: (e: any) => void
      /**
       * Function will be called when the operation is successful.
       * @param i some information of email
       */
      success: (i: object) => void
   }
}

export interface IMailer {
   /**
    * Send an email with header information (_messageHeader_) and body (_templateEmail_).
    * @param messageHeader header of email ({@link MessageHeader})
    * @param templateEmail template of email body ({@link TemplateEmail})
    * @param options option of mailer ({@link MailerOptions})
    */
   send: (messageHeader: MessageHeader, templateEmail: TemplateEmail, options?: MailerOptions) => any
}

/**
 * An implementation of {@link IMailer}
 */
export class Mailer implements IMailer {
    private readonly transport: any
    private readonly from: string

    private readonly output

    constructor(from: string, output?: string) {
        this.from = from
        this.transport = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: process.env.MAILER_PORT,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASSWORD
            }
        })
        this.output = output || path.join(__dirname, "outputs")
    }

    send(messageHeader: MessageHeader, templateEmail: TemplateEmail, options?: MailerOptions) {
        const callbacks = options.callbacks
        const savedJSON = options.savedJSON
        const test = options.test

        try {
            const _messageHeader = Object.assign({ from: this.from }, messageHeader)
            const message = { ..._messageHeader, html: templateEmail.toHtml(), text: templateEmail.toText() }

            if (!test) {
                this.transport.sendMail(message, (err, info) => {
                    if (err) {
                        console.error(err)
                        if (callbacks && typeof callbacks.error === "function") callbacks.error(err)
                    } else {
                        console.debug("Email was sent to " + messageHeader.to)
                        if (callbacks && typeof callbacks.success === "function") callbacks.success(info)
                    }
                })
            }

            if (savedJSON) {
                const templateEmailJSON = templateEmail.toJson()
                const pathFileJSON: string = path.join(this.output, savedJSON.filename + ".json")
                fs.writeFile(pathFileJSON, JSON.stringify({ ..._messageHeader, ...templateEmailJSON }, null, 2), "utf8", err => {
                    if (err) console.error(err)
                    else console.debug("Save email in " + pathFileJSON)
                })
            }
        } catch (e) {
            console.error(e)
            if (callbacks && typeof callbacks.error === "function") callbacks.error(e)
        }
    }
}
