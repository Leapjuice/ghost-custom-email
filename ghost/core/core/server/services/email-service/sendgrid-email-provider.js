const logging = require('@tryghost/logging');
const errors = require('@tryghost/errors');
const debug = require('@tryghost/debug')('email-service:sendgrid-provider-service');

/**
 * @typedef {object} Recipient
 * @prop {string} email
 * @prop {Replacement[]} replacements
 */

/**
 * @typedef {object} Replacement
 * @prop {string} token
 * @prop {string} value
 * @prop {string} id
 */

/**
 * @typedef {object} EmailSendingOptions
 * @prop {boolean} clickTrackingEnabled
 * @prop {boolean} openTrackingEnabled
 * @prop {Date} deliveryTime
 */

/**
 * @typedef {object} EmailProviderSuccessResponse
 * @prop {string} id
 */

class SendGridEmailProvider {
    #sendGridClient;
    #errorHandler;

    /**
     * @param {object} dependencies
     * @param {object} dependencies.sendGridClient - sendgrid client to send emails
     * @param {Function} [dependencies.errorHandler] - custom error handler for logging exceptions
     */
    constructor({
        sendGridClient,
        errorHandler
    }) {
        this.#sendGridClient = sendGridClient;
        this.#errorHandler = errorHandler;
    }

    /**
     * Send an email using the SendGrid API
     * @param {import('./sending-service').EmailData} data
     * @param {EmailSendingOptions} options
     * @returns {Promise<EmailProviderSuccessResponse>}
     */
    async send(data, options) {
        const {
            subject,
            html,
            plaintext,
            from,
            replyTo,
            emailId,
            recipients,
            replacementDefinitions
        } = data;

        logging.info(`Sending email to ${recipients.length} recipients via SendGrid`);
        const startTime = Date.now();
        debug(`sending message to ${recipients.length} recipients`);

        try {
            // Build recipient data for SendGrid
            const recipientData = recipients.reduce((acc, recipient) => {
                const recipientInfo = {};

                // Add replacements
                if (recipient.replacements) {
                    for (const replacement of recipient.replacements) {
                        recipientInfo[replacement.id] = replacement.value;
                    }
                }

                acc[recipient.email] = recipientInfo;
                return acc;
            }, {});

            // Apply replacement definitions to content
            let htmlContent = html;
            let textContent = plaintext || '';

            for (const replacement of replacementDefinitions) {
                const regexp = replacement.regexp;
                htmlContent = htmlContent.replace(regexp, `%recipient.${replacement.id}%`);
                textContent = textContent.replace(regexp, `%recipient.${replacement.id}%`);
            }

            // Send the email using SendGrid client
            const response = await this.#sendGridClient.send(
                {
                    subject,
                    html: htmlContent,
                    plaintext: textContent,
                    from,
                    replyTo,
                    id: emailId,
                    track_clicks: options.clickTrackingEnabled,
                    track_opens: options.openTrackingEnabled
                },
                recipientData,
                replacementDefinitions
            );

            debug(`sent message (${Date.now() - startTime}ms)`);
            logging.info(`Sent message via SendGrid (${Date.now() - startTime}ms)`);

            // Return provider id
            return {
                id: response.id || 'unknown'
            };
        } catch (e) {
            let ghostError;
            const errorMessage = e.message || 'SendGrid Error';

            ghostError = new errors.EmailError({
                statusCode: e.code || undefined,
                message: errorMessage.slice(0, 2000),
                errorDetails: undefined,
                context: e.context || 'SendGrid Error',
                code: 'BULK_EMAIL_SEND_FAILED',
                help: `https://ghost.org/docs/newsletters/#bulk-email-configuration`
            });

            debug(`failed to send message (${Date.now() - startTime})`);

            throw ghostError;
        }
    }

    getMaximumRecipients() {
        return this.#sendGridClient.getBatchSize();
    }

    /**
     * Returns the configured delay between batches in milliseconds
     *
     * @returns {number}
     */
    getTargetDeliveryWindow() {
        return this.#sendGridClient.getTargetDeliveryWindow();
    }
}

module.exports = SendGridEmailProvider;
