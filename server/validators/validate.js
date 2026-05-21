/**
 * Generic validation middleware factory.
 * Takes a Joi schema and returns Express middleware that validates req.body.
 * Strips unknown fields so only declared properties pass through.
 *
 * Usage in routes:
 *   router.post('/', validate(createProductSchema), controller.create);
 */
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,       // report ALL errors, not just the first
        stripUnknown: true,      // remove fields not in the schema
        allowUnknown: false      // reject unknown keys before stripping
    });

    if (error) {
        const message = error.details.map((d) => d.message).join(', ');
        return res.status(400).json({ message });
    }

    // Replace req.body with the validated & sanitized data
    req.body = value;
    next();
};

module.exports = validate;
