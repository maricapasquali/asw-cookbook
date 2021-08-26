import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

export interface TemplateEmail {
    toHtml(): string
    toText(): string
}

type ResetPasswordEmailData = {
    app_name: string,
    user_name: string
    url: string
}

export class ResetPasswordEmail implements TemplateEmail{

    private readonly template: any
    private readonly data: ResetPasswordEmailData

    constructor(data: ResetPasswordEmailData) {
        let contents = fs.readFileSync(path.join(__dirname, 'reset-password.ejs'), 'utf8');
        this.template = ejs.compile(contents);
        this.data = data
    }

    toHtml(): string{
        return this.template(this.data)
    }

    toText(): string{
        return  `
            ${this.data.app_name}
            Reimpostare la password?
            Gentile ${this.data.user_name},
            se ha richiesto la reimpostazione della password, copia il link sottostante nel browser.
                ${this.data.url}
                
            In caso contrario, ignora questa email.            
            
            ATTENZIONE:
            Il link sarà valido solo per i 30 minuti successivi alla ricezione di questa email.
            
            Il Team ${this.data.app_name}
        `
    }

}