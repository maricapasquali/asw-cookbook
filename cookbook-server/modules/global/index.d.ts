import {Validator} from "../../../shared/src/validator";

import {IFileUploader} from "../uploader";
import {IJwtTokensManager} from "../jwt.token";
import {IRbacWithRole} from "../rbac";
import {IMailer} from "../mailer";

declare global {

    var fileUploader: IFileUploader

    var tokensManager: IJwtTokensManager

    var accessManager: IRbacWithRole

    var mailer: IMailer

    var app_name: string

    var configuration: any

    var EmailValidator: Validator<string>
}

export {}
