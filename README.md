# Ghost CMS - Leapjuice Custom Email Edition

<p align="center">
  <a href="https://ghost.org">
    <img src="https://ghost.org/assets/images/logo.png" alt="Ghost CMS" width="120" />
  </a>
</p>

<h1 align="center">
  Leapjuice Ghost Custom Email
</h1>

<p align="center">
  <strong>Ghost CMS 6.20.1</strong> modified by Leapjuice with <strong>multiple built-in email provider options</strong> for sending newsletters.
</p>

<p align="center">
  <a href="https://github.com/Leapjuice/ghost-custom-email/releases">
    <img src="https://img.shields.io/github/v/release/Leapjuice/ghost-custom-email?include_prereleases&label=latest" alt="Latest Release" />
  </a>
  <a href="https://github.com/Leapjuice/ghost-custom-email/stargazers">
    <img src="https://img.shields.io/github/stars/Leapjuice/ghost-custom-email" alt="Stars" />
  </a>
  <a href="https://github.com/Leapjuice/ghost-custom-email/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Leapjuice/ghost-custom-email" alt="License" />
  </a>
  <a href="https://discord.gg/ghost">
    <img src="https://img.shields.io/discord/830823003789600809?label=Discord" alt="Discord" />
  </a>
</p>

---

## Table of Contents

- [What is This?](#what-is-this)
- [Why This Exists](#why-this-exists)
- [Features](#features)
- [Email Providers Supported](#email-providers-supported)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Setting Up Email in Ghost Admin](#setting-up-email-in-ghost-admin)
- [Docker Deployment](#docker-deployment)
- [Building from Source](#building-from-source)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## What is This?

This is a **modified version of Ghost CMS 6.20.1** created by [Leapjuice](https://leapjuice.com). It adds the ability to choose from **multiple email providers** for sending newsletters - not just Mailgun.

Standard Ghost CMS only supports Mailgun for bulk email. This edition adds native support for:

- **Mailgun** (default, built-in)
- **SendGrid** (new!)
- **SMTP** (new! - use any email server)

---

## Why This Exists

We created this modified version because:

1. **Flexibility** - Not everyone wants to use Mailgun. Some users already have SendGrid accounts, or prefer to use their own SMTP server.

2. **Cost Savings** - If you already pay for SendGrid or have your own mail server, why pay for Mailgun too?

3. **Simplicity** - Some users find Mailgun's setup confusing. SMTP is more familiar (Gmail, Outlook, etc.).

4. **Enterprise Needs** - Businesses may have strict requirements for where their email is sent from.

5. **Transparency** - We believe in open source and want to give users choice in their email delivery.

---

## Features

- Ghost 6.20.1 - Latest stable Ghost release with all official features
- Multiple Email Providers - Choose Mailgun, SendGrid, or SMTP
- Easy Admin Configuration - Set up email directly from Ghost admin panel
- Docker Ready - Pre-built Docker image available
- Open Source - Full transparency on what was modified
- Production Ready - Optimized for production deployment
- Leapjuice Ready - Ready for deployment on Leapjuice sovereign enterprise platform

---

## Email Providers Supported

| Provider | Best For | Setup Complexity |
|----------|----------|------------------|
| **Mailgun** | High volume newsletters, best deliverability | Medium |
| **SendGrid** | Easy setup, good deliverability | Easy |
| **SMTP** | Full control, existing email infrastructure | Easy-Medium |

### Mailgun (Default)
The original and default email provider for Ghost. Great for high-volume newsletters with excellent deliverability.

**Required settings:**
- Domain (e.g., `mg.yourdomain.com`)
- API Key (Private key from Mailgun)

### SendGrid
Popular email API service by Twilio. Easy to set up with good deliverability.

**Required settings:**
- API Key (SendGrid API key)

### SMTP
Use any SMTP server - Gmail, Outlook, Amazon SES, your own mail server, etc.

**Required settings:**
- SMTP Host (e.g., `smtp.gmail.com`)
- SMTP Port (usually 587 for TLS or 465 for SSL)
- Username & Password
- Encryption (TLS/SSL)

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Run with SendGrid
docker run -d \
  --name ghost \
  -p 2368:2368 \
  -e url=http://your-domain.com \
  -e email_provider=sendgrid \
  -e sendgrid_api_key=SG.xxxxxxxxxxxx \
  leapjuice/ghost-custom-email:6.20.1-leapjuice
```

### Option 2: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  ghost:
    image: leapjuice/ghost-custom-email:6.20.1-leapjuice
    ports:
      - "2368:2368"
    environment:
      url: http://your-domain.com
      email_provider: sendgrid
      sendgrid_api_key: YOUR_SENDGRID_API_KEY
```

```bash
docker-compose up -d
```

---

## Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for Docker installation)
- **OR** Node.js 22+ (for building from source)

### Installing the Docker Image

```bash
# Pull the image from Docker Hub
docker pull leapjuice/ghost-custom-email:6.20.1-leapjuice

# Or use the latest tag
docker pull leapjuice/ghost-custom-email:latest
```

### Running the Container

```bash
docker run -d \
  --name my-ghost \
  -p 2368:2368 \
  -e url=http://localhost:2368 \
  -e email_provider=sendgrid \
  -e sendgrid_api_key=YOUR_API_KEY \
  leapjuice/ghost-custom-email:6.20.1-leapjuice
```

Then open http://localhost:2368/ghost to set up Ghost.

---

## Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `url` | Your Ghost site URL | Yes | `https://example.com` |
| `email_provider` | Email provider: `mailgun`, `sendgrid`, or `smtp` | Yes | `sendgrid` |

### Mailgun Configuration

```bash
-e email_provider=mailgun
-e mailgun__domain=mg.yourdomain.com
-e mailgun__api_key=key-xxxxxxxxxxxxx
-e mailgun__base_url=https://api.mailgun.net/v3
```

### SendGrid Configuration

```bash
-e email_provider=sendgrid
-e sendgrid_api_key=SG.xxxxxxxxxxxxxxxxxxxxxxxx
```

### SMTP Configuration

```bash
-e email_provider=smtp
-e smtp_host=smtp.gmail.com
-e smtp_port=587
-e smtp_user=your-email@gmail.com
-e smtp_password=your-app-password
-e smtp_secure=true
```

> **Note:** For Gmail, you need an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

---

## Setting Up Email in Ghost Admin

Once Ghost is running, you can configure email directly from the admin interface:

1. **Access Ghost Admin**
   - Open `http://your-domain.com/ghost`
   - Complete the setup wizard if prompted

2. **Navigate to Email Settings**
   - Go to **Settings** (gear icon)
   - Click **Email newsletter** in the left sidebar

3. **Configure Email Provider**
   - Find the **"Email Provider"** section (new in this edition!)
   - Select your provider from the dropdown:
     - **Mailgun** - Default, enter domain and API key
     - **SendGrid** - Enter your SendGrid API key
     - **SMTP** - Enter host, port, username, password
   - Click **Save**

4. **Test It**
   - Try sending a test newsletter to verify delivery

That's it! Your newsletters will now be sent through your chosen provider.

---

## Docker Deployment

### Basic Deployment

```bash
# Create a directory for your Ghost setup
mkdir ghost && cd ghost

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  ghost:
    image: leapjuice/ghost-custom-email:6.20.1-leapjuice
    restart: unless-stopped
    ports:
      - "2368:2368"
    environment:
      url: https://your-domain.com
      email_provider: sendgrid
      sendgrid_api_key: YOUR_API_KEY
    volumes:
      - ghost-content:/home/ghost/content

volumes:
  ghost-content:
EOF

# Start Ghost
docker-compose up -d
```

### Production Deployment with MySQL

```yaml
version: '3.8'
services:
  ghost:
    image: leapjuice/ghost-custom-email:6.20.1-leapjuice
    restart: unless-stopped
    ports:
      - "2368:2368"
    environment:
      url: https://your-domain.com
      database__client: mysql
      database__connection__host: db
      database__connection__user: ghost
      database__connection__password: your-password
      database__connection__database: ghost_production
      email_provider: sendgrid
      sendgrid_api_key: YOUR_API_KEY
    depends_on:
      - db
    volumes:
      - ghost-content:/home/ghost/content

  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root-password
      MYSQL_DATABASE: ghost_production
      MYSQL_USER: ghost
      MYSQL_PASSWORD: your-password
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  ghost-content:
  mysql-data:
```

### Using with a Reverse Proxy (HTTPS)

For HTTPS, we recommend using a reverse proxy like Caddy, Nginx, or Traefik.

**Example with Caddy 2:**

```bash
# Caddyfile
your-domain.com {
    reverse_proxy localhost:2368
}
```

---

## Building from Source

If you want to build the Docker image yourself:

```bash
# Clone the repository
git clone https://github.com/Leapjuice/ghost-custom-email.git
cd ghost-custom-email

# Install dependencies and build
cd ghost/core
yarn install
yarn build:admin
cd ../..

# Build Docker image
docker build -f Dockerfile.leapjuice -t my-ghost:latest .

# Run
docker run -d -p 2368:2368 my-ghost:latest
```

---

## Troubleshooting

### Email Not Sending

1. **Check credentials** - Verify your API keys are correct in Ghost Admin > Settings > Email newsletter
2. **Check container logs** - `docker-compose logs ghost`
3. **Verify provider settings** - Make sure you selected the correct provider
4. **Check spam folder** - Sometimes emails end up in spam

### Container Won't Start

1. **Check logs** - `docker-compose logs`
2. **Verify environment variables** - Ensure all required variables are set
3. **Check port availability** - Port 2368 might be in use

### Build Issues

If you encounter build issues:

```bash
# Clean and rebuild
docker system prune -a
docker-compose build --no-cache
```

### Common Error Messages

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | Check your SMTP host/port |
| `Invalid API key` | Verify your Mailgun/SendGrid API key |
| `Authentication failed` | Check username/password for SMTP |

---

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### What We Modified

For transparency, here's what we changed from the original Ghost CMS:

1. **Settings Schema** - Added new settings for email provider selection and credentials
2. **Email Service Wrapper** - Modified to select provider based on settings
3. **New Providers** - Added SendGrid and SMTP email providers
4. **Admin UI** - Added new settings UI for provider selection
5. **Dependencies** - Added @sendgrid/mail package

---

## License

This project is based on [Ghost CMS](https://github.com/TryGhost/Ghost), which is open source under the MIT License.

The Leapjuice modifications are provided as-is under the same MIT License.

See [LICENSE](LICENSE) for details.

---

## Support

### Getting Help

- Ghost Documentation: https://ghost.org/docs/
- Ghost Community Forum: https://forum.ghost.org/
- Report Bugs: https://github.com/Leapjuice/ghost-custom-email/issues
- Leapjuice Website: https://.com

### About Leapjuice

leapjuice[Leapjuice](https://leapjuice.com) is a sovereign enterprise platform that helps businesses deploy open-source software with full data ownership and control.

This modified Ghost edition is part of our commitment to providing flexible, transparent solutions for our customers.

---

<p align="center">
  Built with by <a href="https://leapjuice.com">Leapjuice</a>
</p>
