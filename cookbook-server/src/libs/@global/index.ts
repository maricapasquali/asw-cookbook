import config from "cookbook-shared/environment";
import {EmailValidator} from "cookbook-shared/libs/validator";
import "cookbook-shared/libs/lang"

import {JwtTokensManager} from "../jwt.token";
import {createRBAC} from "../rbac";
import {Mailer} from "../mailer";
import {FileUploader} from "../uploader";
import {FilesystemResource} from "../../filesystem";

global.configuration = config

global.app_name = config.appName

global.tokensManager = new JwtTokensManager(config.client.origin, config.server["sub-domain"].api.origin)

global.accessManager = createRBAC()

global.mailer = new Mailer(`no-reply@${config.appName.toLowerCase()}.com`, FilesystemResource.Email.path())

global.fileUploader = new FileUploader()

global.EmailValidator = EmailValidator
