const debug = require('@tryghost/debug');
const logging = require('@tryghost/logging');
const metrics = require('@tryghost/metrics');
const errors = require('@tryghost/errors');

module.exports = class SmtpClient {
    #config;
    #settings;

    static DEFAULT_BATCH_SIZE = 100;

    constructor({config, settings}) {
        this.#config = config;
        this.#settings = settings;
    }

    /**
     * Sends an email using SMTP
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
        const smtpConfig = this.#getConfig();
        if (!smtpConfig) {
            logging.warn(`SMTP is not configured`);
            return null;
        }

        const batchSize = this.getBatchSize();
        if (Object.keys(recipientData).length > batchSize) {
            throw new errors.IncorrectUsageError({
                message: `SMTP only supports sending to ${batchSize} recipients at a time`
            });
        }

        let startTime;
        let transport;
        try {
            // Get nodemailer
            const nodemailer = require('@tryghost/nodemailer');

            // Create SMTP transport
            transport = nodemailer.createTransport({
                host: smtpConfig.host,
                port: smtpConfig.port,
                secure: smtpConfig.secure,
                auth: smtpConfig.user ? {
                    user: smtpConfig.user,
                    pass: smtpConfig.password
                } : undefined
            });

            // Verify connection
            await new Promise((resolve, reject) => {
                transport.verify((error, success) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(success);
                    }
                });
            });

            // Send emails to each recipient individually
            const results = [];
            const recipientEmails = Object.keys(recipientData);

            for (const email of recipientEmails) {
                const recipient = recipientData[email];

                // Apply replacements to content
                let html = message.html;
                let text = message.plaintext;

                for (const replacement of replacements) {
                    const regexp = replacement.regexp;
                    html = html.replace(regexp, `%recipient.${replacement.id}%`);
                    text = text ? text.replace(regexp, `%recipient.${replacement.id}%`) : '';
                }

                // Replace tokens with recipient-specific values
                for (const [key, value] of Object.entries(recipient)) {
                    const token = `%${key}%`;
                    html = html.replace(new RegExp(token, 'g'), value);
                    text = text ? text.replace(new RegExp(token, 'g'), value) : '';
                }

                const mailOptions = {
                    from: message.from,
                    to: email,
                    subject: message.subject,
                    html: html,
                    text: text,
                    replyTo: message.replyTo || message.reply_to
                };

                // Add headers
                mailOptions.headers = {
                    'X-Auto-Response-Suppress': 'OOF, AutoReply',
                    'Auto-Submitted': 'auto-generated'
                };

                // Add email ID for tracking
                if (message.id) {
                    mailOptions.headers['X-Email-ID'] = message.id;
                }

                const result = await transport.sendMail(mailOptions);
                results.push({
                    email,
                    messageId: result.messageId
                });
            }

            // Close the transport
            transport.close();

            metrics.metric('smtp-send-mail', {
                value: Date.now() - startTime,
                statusCode: 200
            });

            return {
                id: results[0]?.messageId || 'unknown'
            };
        } catch (error) {
            logging.error(error);
            metrics.metric('smtp-send-mail', {
                value: Date.now() - startTime,
                statusCode: error.code || 500
            });

            if (transport) {
                try {
                    transport.close();
                } catch (e) {
                    // Ignore close errors
                }
            }

            return Promise.reject({error, message});
        }
    }

    #getConfig() {
        const host = this.#settings.get('smtp_host');
        const port = this.#settings.get('smtp_port');
        const user = this.#settings.get('smtp_user');
        const password = this.#settings.get('smtp_password');
        const secure = this.#settings.get('smtp_secure');

        if (!host || !port) {
            return null;
        }

        return {
            host,
            port: parseInt(port, 10),
            user: user || null,
            password: password || null,
            secure: secure !== false
        };
    }

    /**
     * Returns whether SMTP is configured via settings
     *
     * @returns {boolean}
     */
    isConfigured() {
        const config = this.#getConfig();
        return !!config;
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
     * Defaults to 60000ms (1 minute) if not set (SMTP is slower)
     *
     * @returns {number}
     */
    getTargetDeliveryWindow() {
        const targetDeliveryWindow = this.#config.get('bulkEmail')?.targetDeliveryWindow;
        // If targetDeliveryWindow is not set or is not a positive integer, return default
        if (targetDeliveryWindow === undefined || !Number.isInteger(parseInt(targetDeliveryWindow)) || parseInt(targetDeliveryWindow) < 0) {
            return 60000;
        }
        return parseInt(targetDeliveryWindow);
    }
};
