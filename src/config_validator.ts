import { arraysEqual } from "./helpers/discord_utils";
import * as fs from "fs";
import _logger from "./logger";
const logger = _logger("config_validator");

const allowedOptions = {
    botToken: { required: true },
    dbUser: { required: true },
    dbPassword: { required: true },
    songCacheDir: { required: true },
    topGGToken: { required: false }
};

export function validateConfig(config): boolean {
    let valid = true;
    //check for mismatch between template and this file
    let templateOptions = JSON.parse(fs.readFileSync("../config/app_config.json.template").toString());
    if (!arraysEqual(Object.keys(allowedOptions), Object.keys(templateOptions))) {
        logger.error(`Configuration template and allowed options mismatch\n Allowed Options: ${Object.keys(allowedOptions)}\n Template Options: ${Object.keys(templateOptions)}`);
        valid = false;
    }
    //check for extraneous config options
    for (let option in config) {
        if (!(option in allowedOptions)) {
            logger.error(`Unknown configuration option: ${option}`);
            valid = false;
        }
    }
    //check for required config options
    for (let option in allowedOptions) {
        let optionRequired = allowedOptions[option].required;
        if (optionRequired && !(option in config)) {
            logger.error(`Missing required configuration option: ${option}`);
            valid = false;
        }
    }
    return valid;

}