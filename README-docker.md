# LeapJuice Ghost CMS - Custom Email Edition

![Ghost Version](https://img.shields.io/badge/Ghost-6.20.1-blue)
![LeapJuice Edition](https://img.shields.io/badge/LeapJuice-Custom%20Email-orange)

## Overview

This is **LeapJuice Ghost CMS v6.20.1**, a modified version of the official Ghost 6.20.1 release, enhanced with **multiple built-in email provider options** for sending newsletters.

### Features

- ✅ **Ghost 6.20.1** - Latest stable Ghost release
- ✅ **Multiple Email Providers** - Choose from Mailgun, SendGrid, or SMTP
- ✅ **Easy Admin Configuration** - Configure email directly from Ghost admin panel
- ✅ **Production Ready** - Optimized Docker image for deployment
- ✅ **Sovereign Enterprise Ready** - Deploy on your own infrastructure with LeapJuice

## What's Different?

Standard Ghost CMS only supports **Mailgun** for bulk email newsletter delivery. This LeapJuice edition adds:

| Provider | Description | Best For |
|----------|-------------|----------|
| **Mailgun** | Default, reliable email service | High volume newsletters |
| **SendGrid** | Popular email API service | Easy setup, good deliverability |
| **SMTP** | Use any email server (Gmail, Outlook, custom) | Full control, existing email infrastructure |

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Create a docker-compose.yml file (see example below)
# 2. Run the container
docker-compose up -d
# 3. Access Ghost admin at http://localhost:2368/ghost
```

### Option 2: Docker Run

```bash
docker run -d \
  --name leapjuice-ghost \
  -p 2368:2368 \
  -e url=http://localhost:2368 \
  -e email_provider=sendgrid \
  -e sendgrid_api_key=YOUR_API_KEY \
  leapjuice/ghost-custom-email:6.20.1-leapjuice
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `url` | Your Ghost site URL | Yes |
| `email_provider` | Email provider: `mailgun`, `sendgrid`, or `smtp` | Yes |
| `mailgun__domain` | Mailgun domain | For Mailgun |
| `mailgun__api_key` | Mailgun private API key | For Mailgun |
| `mailgun__base_url` | Mailgun API URL (US or EU) | For Mailgun |
| `sendgrid_api_key` | SendGrid API key | For SendGrid |
| `smtp_host` | SMTP server hostname | For SMTP |
| `smtp_port` | SMTP port (587 or 465) | For SMTP |
| `smtp_user` | SMTP username | For SMTP |
| `smtp_password` | SMTP password | For SMTP |
| `smtp_secure` | Use TLS/SSL (true/false) | For SMTP |

### Example: Using SendGrid

```yaml
version: '3.8'
services:
  ghost:
    image: leapjuice/ghost-custom-email:6.20.1-leapjuice
    ports:
      - "2368:2368"
    environment:
      url: https://your-domain.com
      email_provider: sendgrid
      sendgrid_api_key: SG.xxxxxxxxxxxxxxxxxxxxxxxx
```

### Example: Using SMTP (Gmail)

```yaml
version: '3.8'
services:
  ghost:
    image: leapjuice/ghost-custom-email:6.20.1-leapjuice
    ports:
      - "2368:2368"
    environment:
      url: https://your-domain.com
      email_provider: smtp
      smtp_host: smtp.gmail.com
      smtp_port: 587
      smtp_user: your-email@gmail.com
      smtp_password: your-app-password
      smtp_secure: "true"
```

> **Note:** For Gmail, you need an "App Password", not your regular password. Enable 2-Step Verification in your Google account, then create an App Password at myaccount.google.com/apppasswords

## Setting Up Email in Ghost Admin

Once Ghost is running:

1. Go to **http://your-domain.com/ghost**
2. Complete the setup wizard
3. Navigate to **Settings > Email newsletter**
4. You'll see **"Email Provider"** section
5. Select your provider (Mailgun, SendGrid, or SMTP)
6. Enter your credentials
7. Click **Save**

That's it! Your newsletters will now be sent through your chosen provider.

## Using with MySQL (Production)

For production deployments, use MySQL instead of SQLite:

```yaml
version: '3.8'
services:
  ghost:
    image: leapjuice/ghost-custom-email:6.20.1-leapjuice
    ports:
      - "2368:2368"
    environment:
      url: https://your-domain.com
      database__client: mysql
      database__connection__host: db
      database__connection__user: ghost
      database__connection__password: your-db-password
      database__connection__database: ghost
      email_provider: sendgrid
      sendgrid_api_key: YOUR_API_KEY
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root-password
      MYSQL_DATABASE: ghost
      MYSQL_USER: ghost
      MYSQL_PASSWORD: your-db-password
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

## Port Mapping

| Port | Description |
|------|-------------|
| 2368 | Ghost application and admin interface |

Access Ghost at: `http://localhost:2368`
Access Admin at: `http://localhost:2368/ghost`

## Troubleshooting

### Email Not Sending

1. Check credentials in Ghost Admin > Settings > Email newsletter
2. Verify your email provider API keys are correct
3. Check container logs: `docker-compose logs ghost`
4. Ensure your provider allows sending from your domain

### Container Won't Start

1. Check logs: `docker-compose logs`
2. Verify environment variables are set correctly
3. Ensure port 2368 is not already in use

### Need Help?

- [Ghost Documentation](https://ghost.org/docs/)
- [LeapJuice Support](https://leapjuice.com/support/)

## Deployment with LeapJuice

This container is optimized for deployment on **LeapJuice** - the sovereign enterprise platform. Deploy with confidence knowing your data stays in your control.

Learn more at: https://leapjuice.com

## License

This image is based on Ghost CMS, which is open source under the MIT license. The modifications made by LeapJuice are provided as-is.

Ghost CMS License: https://github.com/TryGhost/Ghost/blob/main/LICENSE

## Version History

- **6.20.1-leapjuice** - Latest: Added SendGrid and SMTP support to Mailgun
- **6.20.1** - Base: Official Ghost CMS release

---

**LeapJuice Ghost Custom Email** - Built with ❤️ by LeapJuice
