const debug = require('@tryghost/debug');
const logging = require('@tryghost/logging');
const metrics = require('@tryghost/metrics');
const errors = require('@tryghost/errors');

module.exports = class SendGridClient {
    #config;
    #settings;

    static DEFAULT_BATCH_SIZE = 1000;

    constructor({config, settings}) {
        this.#config = config;
        this.#settings = settings;
    }

    /**
     * Sends an email using SendGrid
     *
     * @param {Object} message
     * @param {Object} recipientData
     * @param {Array<Object>} replacements
     *
     * recipientData format:
     * {
     *     'test@example.com': {
     *         name: 'Test User',
     *         unsubscribe_url: 'https://example.com/unsub/me'
     *     }
     * }
     */
    async send(message, recipientData, replacements) {
        const sendGridInstance = this.getInstance();
        if (!sendGridInstance) {
            logging.warn(`SendGrid is not configured`);
            return null;
        }

        const batchSize = this.getBatchSize();
        if (Object.keys(recipientData).length > batchSize) {
            throw new errors.IncorrectUsageError({
                message: `SendGrid only supports sending to ${batchSize} recipients at a time`
            });
        }

        let startTime;
        try {
            const messageContent = {
                subject: message.subject,
                html: message.html,
                text: message.plaintext,
                from: message.from,
                replyTo: message.replyTo || message.reply_to
            };

            // Build personalizations for each recipient
            const personalizations = Object.keys(recipientData).map(email => {
                const recipient = recipientData[email];
                const personalization = {
                    to: [{email}],
                    substitutions: {}
                };

                // Add recipient-specific substitutions
                for (const [key, value] of Object.entries(recipient)) {
                    if (key !== 'unsubscribe_url' && key !== 'list_unsubscribe') {
                        personalization.substitutions[`%${key}%`] = value;
                    }
                }

                // Add custom unsub link if available
                if (recipient.list_unsubscribe) {
                    personalization.custom_args = {
                        unsubscribe_url: recipient.list_unsubscribe
                    };
                }

                return personalization;
            });

            const mailSettings = {
                sandboxMode: false
            };

            const trackingSettings = {
                clickTracking: {
                    enable: message.track_clicks !== false,
                    enable_text: message.track_clicks !== false
                },
                openTracking: {
                    enable: message.track_opens !== false,
                    substitutionTag: '%open-tracking%'
                }
            };

            const msg = {
                personalizations,
                from: messageContent.from,
                subject: messageContent.subject,
                html: messageContent.html,
                text: messageContent.text,
                reply_to: messageContent.replyTo,
                mail_settings: mailSettings,
                tracking_settings: trackingSettings
            };

            // Add batch ID for tracking
            if (message.id) {
                msg.categories = ['bulk-email', 'ghost-email'];
                msg.custom_args = {
                    ...msg.custom_args,
                    email_id: message.id
                };
            }

            startTime = Date.now();

            const response = await sendGridInstance.send(msg);

            metrics.metric('sendgrid-send-mail', {
                value: Date.now() - startTime,
                statusCode: 200
            });

            return {
                id: response[0].headers['x-message-id'] || 'unknown'
            };
        } catch (error) {
            logging.error(error);
            metrics.metric('sendgrid-send-mail', {
                value: Date.now() - startTime,
                statusCode: error.code || 500
            });
            return Promise.reject({error, message});
        }
    }

    #getConfig() {
        const apiKey = this.#settings.get('sendgrid_api_key');

        if (!apiKey) {
            return null;
        }

        return {
            apiKey
        };
    }

    /**
     * Returns an instance of the SendGrid client based upon the settings
     *
     * @returns {object|null} the SendGrid client instance
     */
    getInstance() {
        const sendGridConfig = this.#getConfig();
        if (!sendGridConfig) {
            return null;
        }

        // Lazy load @sendgrid/mail to avoid issues if not installed
        let sendgrid;
        try {
            sendgrid = require('@sendgrid/mail');
        } catch (e) {
            logging.error('SendGrid package not installed. Run: npm install @sendgrid/mail');
            return null;
        }

        sendgrid.setApiKey(sendGridConfig.apiKey);

        return sendgrid;
    }

    /**
     * Returns whether the SendGrid instance is configured via settings
     *
     * @returns {boolean}
     */
    isConfigured() {
        const instance = this.getInstance();
        return !!instance;
    }

    /**
     * Returns configured batch size
     *
     * @returns {number}
     */
    getBatchSize() {
        return this.#config.get('bulkEmail')?.batchSize ?? this.DEFAULT_BATCH_SIZE;
    }

    /**
     * Returns the configured target delivery window in milliseconds
     * Ghost will attempt to deliver emails evenly distributed over this window
     *
     * Defaults to 10000ms (10 seconds) if not set
     *
     * @returns {number}
     */
    getTargetDeliveryWindow() {
        const targetDeliveryWindow = this.#config.get('bulkEmail')?.targetDeliveryWindow;
        // If targetDeliveryWindow is not set or is not a positive integer, return default
        if (targetDeliveryWindow === undefined || !Number.isInteger(parseInt(targetDeliveryWindow)) || parseInt(targetDeliveryWindow) < 0) {
            return 10000;
        }
        return parseInt(targetDeliveryWindow);
    }
};
