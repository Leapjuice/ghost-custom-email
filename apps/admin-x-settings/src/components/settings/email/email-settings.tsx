import DefaultRecipients from './default-recipients';
import EnableNewsletters from './enable-newsletters';
import EmailProvider from './email-provider';
import Newsletters from './newsletters';
import React from 'react';
import SearchableSection from '../../searchable-section';
import {getSettingValues} from '@tryghost/admin-x-framework/api/settings';
import {useGlobalData} from '../../providers/global-data-provider';

export const searchKeywords = {
    enableNewsletters: ['emails', 'newsletters', 'newsletter sending', 'enable', 'disable', 'turn on', 'turn off'],
    newsletters: ['newsletters', 'emails', 'design', 'customization'],
    defaultRecipients: ['newsletters', 'default recipients', 'emails'],
    emailProvider: ['email', 'provider', 'mailgun', 'sendgrid', 'smtp', 'emails', 'newsletters'],
    newslettersNavMenu: ['emails', 'newsletters', 'newsletter sending', 'enable', 'disable', 'turn on', 'turn off', 'design', 'customization', 'default recipients', 'emails', 'mailgun', 'sendgrid', 'smtp', 'tips', 'donations', 'one time', 'payment']
};

const EmailSettings: React.FC = () => {
    const {settings, config} = useGlobalData();
    const [newslettersEnabled] = getSettingValues(settings, ['editor_default_email_recipients']) as [string];

    return (
        <SearchableSection keywords={Object.values(searchKeywords).flat()} title='Email newsletter'>
            <EnableNewsletters keywords={searchKeywords.enableNewsletters} />
            {newslettersEnabled !== 'disabled' && (
                <>
                    <DefaultRecipients keywords={searchKeywords.defaultRecipients} />
                    <Newsletters keywords={searchKeywords.newsletters} />
                    {!config.mailgunIsConfigured && <EmailProvider keywords={searchKeywords.emailProvider} />}
                </>
            )}
        </SearchableSection>
    );
};

export default EmailSettings;
