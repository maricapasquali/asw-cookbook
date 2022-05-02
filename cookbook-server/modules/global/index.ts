import * as config from "../../../environment/env.config";
import {EmailValidator} from "../../../commons/modules/validator";

import {JwtTokensManager} from "../jwt.token";
import {createRBAC} from "../rbac";
import {Mailer} from "../mailer";
import {FileUploader} from "../uploader";

global.configuration = config

global.app_name = config.appName

global.tokensManager = new JwtTokensManager(config.client.origin, config.server["sub-domain"].api.origin)

global.accessManager = createRBAC()

global.mailer = new Mailer(`no-reply@${config.appName.toLowerCase()}.com`)

global.fileUploader = new FileUploader()

global.EmailValidator = EmailValidator
