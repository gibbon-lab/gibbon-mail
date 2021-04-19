const fs = require('fs');

const Ajv = require('ajv');
const ajv = new Ajv();

class ValidationError extends Error {
    constructor(
        body,
        validate,
        ...params
    ) {
        super(...params);

        this.name = 'Validation error';
        this.body = body;
        this.validate = validate;
    }
}

async function validateSchema(schemaJsonPath, body) {    
    if (!fs.existsSync(schemaJsonPath)) {
        throw new Error(`Schema ${schemaJsonPath} not exists`);
    }
    const jsonSchemaStr = fs.readFileSync(
        schemaJsonPath,
        {
            encoding: 'utf8'
        }
    );
    const jsonSchema = JSON.parse(jsonSchemaStr);

    // Validate body
    const validate = ajv.compile(jsonSchema);
    if (!validate(body)) {
        throw new ValidationError(body, validate);
    }
}

module.exports = {
    ValidationError,
    validateSchema
};
