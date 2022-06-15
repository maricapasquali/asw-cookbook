/* eslint no-var: 0 */

import { Validator } from "cookbook-shared/libs/validator"

import { IFileUploader } from "../uploader"
import { IJwtTokensManager } from "../jwt.token"
import { IRbacWithRole } from "../rbac"
import { IMailer } from "../mailer"

/**
 * Global variables.
 */
declare global {

    var fileUploader: IFileUploader

    var tokensManager: IJwtTokensManager

    var accessManager: IRbacWithRole

    var mailer: IMailer

    var appName: string

    var configuration: any

    var EmailValidator: Validator<string>
}

export {}
