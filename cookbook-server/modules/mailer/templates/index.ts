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

type SignUpEmailData = {
    app_name: string,
    firstname: string
    lastname: string
    email: string
    userID: string
    url: string
}

type SignUpAdminEmailData = {
    app_name: string,
    firstname: string
    lastname: string
    email: string
    userID: string
    passwordDefault: string
}

type EraseUserEmailData = {
    app_name: string,
    firstname: string
    lastname: string
    userID: string
    email: string
}

abstract class ATemplateEmail implements TemplateEmail{
    private readonly template: any
    protected readonly data: any

    protected constructor(file: string, data: any) {
        let contents = fs.readFileSync(path.join(__dirname, file), 'utf8');
        this.template = ejs.compile(contents);
        this.data = data
    }

    toHtml(): string {
        return this.template(this.data)
    }

    abstract toText(): string
}

export class ResetPasswordEmail extends ATemplateEmail{

    constructor(data: ResetPasswordEmailData) {
        super('reset-password.ejs', data)
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

export class SignUpEmail extends ATemplateEmail{

    constructor(data: SignUpEmailData) {
       super('signup.ejs', data)
    }

    toText(): string{
        return  `
            Creazione account ${this.data.app_name}.
            
            Gentile ${this.data.firstname} ${this.data.lastname},
            il suo account è stato creato.
                
                Nome: ${this.data.firstname}
                Cognome: ${this.data.lastname}
                Email: ${this.data.email}
                UserID: ${this.data.userID}
                Password: ********************
            
            Copia il link sottostante nel browser per completare la registrazione:
                ${this.data.url}
            
            Il Team ${this.data.app_name}
        `
    }

}

export class SignUpAdminEmail extends ATemplateEmail{

    constructor(data: SignUpAdminEmailData) {
        super('signup-admin.ejs', data)
    }

    toText(): string{
        return  `
            Creazione account ${this.data.app_name} Amministratore.
            
            Gentile ${this.data.firstname} ${this.data.lastname},
            il suo account è stato creato.
                
                Nome: ${this.data.firstname}
                Cognome: ${this.data.lastname}
                Email: ${this.data.email}
                UserID: ${this.data.userID}
                Password (default): ${this.data.passwordDefault}
            
            Attenzione: cambia la password di default il prima possibile!
            
            Il Team ${this.data.app_name}
        `
    }

}

export class EraseUserEmail extends ATemplateEmail {

    constructor(data: EraseUserEmailData) {
        super('erase-user.ejs', data)
    }

    toText(): string {
        return  `
            Chiusura definitiva dell'account ${this.data.userID}.
            
            Gentile ${this.data.firstname} ${this.data.lastname},
            le comunichiamo che l'account associato a questa email (${this.data.email}) è stato definitivamente cancellato.
                
            Il Team ${this.data.app_name}       
        `;
    }

}