import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

type TemplateEmailJSON = {
    /**
     * File template of email
     */
    template: string
    /**
     * Dynamic data of email
     */
    context: CommonEmailData & any | CommonEmailData & CommonUserEmailData & any | any
}

type CommonEmailData = {
    /**
     * Application name
     */
    app_name: string
}

type CommonUserEmailData = {
    /**
     * First name of user
     */
    firstname: string
    /**
     * Last name of user
     */
    lastname: string
    /**
     * Email of user
     */
    email: string
    /**
     * Username of user
     */
    userID: string
}

/**
 * {@link TemplateEmail} is an interface that represents the content of an email.
 */
export interface TemplateEmail {

    /**
     * @return content of email in HTML format.
     */
    toHtml(): string

    /**
     * @return content of email in plaintext format.
     */
    toText(): string

    /**
     * @return content of email in JSON format.
     */
    toJson(): TemplateEmailJSON
}

/**
 * {@link ATemplateEmail} is a partial implementation of {@link TemplateEmail}
 */
abstract class ATemplateEmail implements TemplateEmail{
    private readonly templateFile: string
    private readonly template: any
    protected readonly data: any

    constructor(file: string, data: any) {
        let contents = fs.readFileSync(path.join(__dirname, file), 'utf8');
        this.templateFile = file;
        this.template = ejs.compile(contents);
        this.data = data
    }

    toHtml(): string {
        return this.template(this.data)
    }

    toJson(): TemplateEmailJSON {
        return { template: this.templateFile, context: this.data }
    }

    abstract toText(): string
}

export namespace TemplateEmail {

    /**
     * Create an instance of {@link TemplateEmail} for Reset Password
     * @param data instance of {@link CommonEmailData} plus { user_name: string, url: string }
     */
    export function createResetPasswordEmail(data: CommonEmailData & { user_name: string, url: string }): TemplateEmail {
        return new class extends ATemplateEmail {
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
        }('reset-password.ejs', data)
    }

    /**
     * Create an instance of {@link TemplateEmail} for Signup
     * @param data instance of {@link CommonEmailData} plus {@link CommonUserEmailData} plus { url: string }
     */
    export function createSignUpEmail(data: CommonEmailData & CommonUserEmailData & { url: string }): TemplateEmail {
        return new class extends ATemplateEmail {
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

        }('signup.ejs', data)
    }

    /**
     * Create an instance of {@link TemplateEmail} for Administrator Signup
     * @param data instance of {@link CommonEmailData} plus {@link CommonUserEmailData} plus { passwordDefault: string }
     */
    export function createSignUpAdminEmail(data: CommonEmailData & CommonUserEmailData & { passwordDefault: string }): TemplateEmail {
        return new class extends ATemplateEmail {
            toText(): string {
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

        }('signup-admin.ejs', data)
    }

    /**
     * Create an instance of {@link TemplateEmail} for Erase User Account
     * @param data instance of {@link CommonEmailData}  plus {@link CommonUserEmailData}
     */
    export function createEraseUserEmail(data: CommonEmailData & CommonUserEmailData): TemplateEmail {
        return new class extends ATemplateEmail {
            toText(): string {
                return  `
                    Chiusura definitiva dell'account ${this.data.userID}.
                    
                    Gentile ${this.data.firstname} ${this.data.lastname},
                    le comunichiamo che l'account associato a questa email (${this.data.email}) è stato definitivamente cancellato.
                        
                    Il Team ${this.data.app_name}       
                `;
            }

        }('erase-user.ejs', data)
    }
}
