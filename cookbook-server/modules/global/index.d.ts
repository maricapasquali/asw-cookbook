import {Validator} from "../../../commons/modules/validator";

import {IFileUploader, UploaderConfiguration} from "../uploader";
import {IJwtTokensManager} from "../jwt.token";
import {IRbacWithRole} from "../rbac";
import {IMailer} from "../mailer";

declare global {

    var fileUploader: IFileUploader

    var FileConfigurationImage: UploaderConfiguration

    var FileConfigurationVideo: UploaderConfiguration

    var tokensManager: IJwtTokensManager

    var accessManager: IRbacWithRole

    var mailer: IMailer

    var app_name: string

    var configuration: any

    var EmailValidator: Validator<string>
}

export {}
