import React from 'react';
import TopLevelGroup from '../../top-level-group';
import useSettingGroup from '../../../hooks/use-setting-group';
import {IconLabel, Link, Select, SettingGroupContent, TextField, withErrorBoundary} from '@tryghost/admin-x-design-system';
import {getSettingValues, useEditSettings} from '@tryghost/admin-x-framework/api/settings';
import {useHandleError} from '@tryghost/admin-x-framework/hooks';

const EMAIL_PROVIDERS = [
    {label: 'Mailgun', value: 'mailgun'},
    {label: 'SendGrid', value: 'sendgrid'},
    {label: 'SMTP', value: 'smtp'}
];

const MAILGUN_REGIONS = [
    {label: '🇺🇸 US', value: 'https://api.mailgun.net/v3'},
    {label: '🇪🇺 EU', value: 'https://api.eu.mailgun.net/v3'}
];

const EmailProvider: React.FC<{ keywords: string[] }> = ({keywords}) => {
    const {
        localSettings,
        isEditing,
        saveState,
        handleSave,
        handleCancel,
        updateSetting,
        handleEditingChange
    } = useSettingGroup();
    const {mutateAsync: editSettings} = useEditSettings();
    const handleError = useHandleError();

    const [emailProvider, mailgunRegion, mailgunDomain, mailgunApiKey, sendgridApiKey, smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure] = getSettingValues(localSettings, [
        'email_provider', 'mailgun_base_url', 'mailgun_domain', 'mailgun_api_key', 'sendgrid_api_key',
        'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_secure'
    ]) as string[];

    const currentProvider = emailProvider || 'mailgun';

    const isMailgunSetup = currentProvider === 'mailgun' && mailgunDomain && mailgunApiKey;
    const isSendGridSetup = currentProvider === 'sendgrid' && sendgridApiKey;
    const isSmtpSetup = currentProvider === 'smtp' && smtpHost && smtpPort;

    const isProviderSetup = isMailgunSetup || isSendGridSetup || isSmtpSetup;

    const getStatusText = () => {
        if (isProviderSetup) {
            return `${currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)} is set up`;
        }
        return `${currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)} is not set up`;
    };

    const getStatusIcon = () => {
        if (isProviderSetup) {
            return <IconLabel icon='check-circle' iconColorClass='text-green'>{getStatusText()}</IconLabel>;
        }
        return getStatusText();
    };

    const data = [
        {
            key: 'status',
            value: getStatusIcon()
        }
    ];

    const values = (
        <SettingGroupContent
            columns={1}
            values={data}
        />
    );

    const mailgunInputs = (
        <SettingGroupContent>
            <div className='grid grid-cols-[120px_auto] gap-x-3 gap-y-6'>
                <Select
                    options={MAILGUN_REGIONS}
                    selectedOption={MAILGUN_REGIONS.find(option => option.value === mailgunRegion)}
                    title="Mailgun region"
                    onSelect={(option) => {
                        updateSetting('mailgun_base_url', option?.value || null);
                    }}
                />
                <TextField
                    title='Mailgun domain'
                    value={mailgunDomain}
                    onChange={(e) => {
                        updateSetting('mailgun_domain', e.target.value);
                    }}
                />
                <div className='col-span-2'>
                    <TextField
                        hint={<>Find your Mailgun API keys <Link href="https://app.mailgun.com/settings/api_security" rel="noopener noreferrer" target="_blank">here</Link></>}
                        title='Mailgun private API key'
                        type='password'
                        value={mailgunApiKey}
                        onChange={(e) => {
                            updateSetting('mailgun_api_key', e.target.value);
                        }}
                    />
                </div>
            </div>
        </SettingGroupContent>
    );

    const sendgridInputs = (
        <SettingGroupContent>
            <div className='grid grid-cols-1 gap-y-6'>
                <TextField
                    hint={<>Find your SendGrid API keys <Link href="https://app.sendgrid.com/settings/api_keys" rel="noopener noreferrer" target="_blank">here</Link></>}
                    title='SendGrid API Key'
                    type='password'
                    value={sendgridApiKey}
                    onChange={(e) => {
                        updateSetting('sendgrid_api_key', e.target.value);
                    }}
                />
            </div>
        </SettingGroupContent>
    );

    const smtpInputs = (
        <SettingGroupContent>
            <div className='grid grid-cols-[1fr_80px] gap-x-3 gap-y-6'>
                <TextField
                    title='SMTP host'
                    value={smtpHost}
                    placeholder='smtp.example.com'
                    onChange={(e) => {
                        updateSetting('smtp_host', e.target.value);
                    }}
                />
                <TextField
                    title='SMTP port'
                    value={smtpPort}
                    placeholder='587'
                    onChange={(e) => {
                        updateSetting('smtp_port', e.target.value);
                    }}
                />
                <TextField
                    title='SMTP username'
                    value={smtpUser}
                    onChange={(e) => {
                        updateSetting('smtp_user', e.target.value);
                    }}
                />
                <TextField
                    title='SMTP password'
                    type='password'
                    value={smtpPassword}
                    onChange={(e) => {
                        updateSetting('smtp_password', e.target.value);
                    }}
                />
                <div className='col-span-2'>
                    <Select
                        options={[
                            {label: 'TLS (Port 587)', value: 'true'},
                            {label: 'SSL (Port 465)', value: 'false'}
                        ]}
                        selectedOption={smtpSecure === 'true' ? {label: 'TLS (Port 587)', value: 'true'} : {label: 'SSL (Port 465)', value: 'false'}}
                        title="Encryption"
                        onSelect={(option) => {
                            updateSetting('smtp_secure', option?.value === 'true');
                        }}
                    />
                </div>
            </div>
        </SettingGroupContent>
    );

    const getProviderInputs = () => {
        switch (currentProvider) {
        case 'sendgrid':
            return sendgridInputs;
        case 'smtp':
            return smtpInputs;
        default:
            return mailgunInputs;
        }
    };

    const groupDescription = (
        <>The email provider is used for bulk email newsletter delivery. <Link href='https://ghost.org/docs/faq/mailgun-newsletters/' target='_blank'>Why is this required?</Link></>
    );

    return (
        <TopLevelGroup
            description={groupDescription}
            isEditing={isEditing}
            keywords={keywords}
            navid='email-provider'
            saveState={saveState}
            testId='email-provider'
            title='Email Provider'
            onCancel={handleCancel}
            onEditingChange={handleEditingChange}
            onSave={async () => {
                // Set default mailgun region if not set
                if (currentProvider === 'mailgun' && !mailgunRegion) {
                    try {
                        await editSettings([{key: 'mailgun_base_url', value: MAILGUN_REGIONS[0].value}]);
                    } catch (e) {
                        handleError(e);
                        return;
                    }
                }
                handleSave();
            }}
        >
            {isEditing ? (
                <>
                    <SettingGroupContent>
                        <div className='mb-6'>
                            <Select
                                options={EMAIL_PROVIDERS}
                                selectedOption={EMAIL_PROVIDERS.find(option => option.value === currentProvider)}
                                title="Email provider"
                                onSelect={(option) => {
                                    updateSetting('email_provider', option?.value || 'mailgun');
                                }}
                            />
                        </div>
                    </SettingGroupContent>
                    {getProviderInputs()}
                </>
            ) : values}
        </TopLevelGroup>
    );
};

export default withErrorBoundary(EmailProvider, 'Email Provider');
