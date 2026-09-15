# Adrenabook

> Technical documentation

Adrenabook is a web platform for booking outdoor activities.
Users can search for activities, check availability and make reservations.
Professionals can manage their activities, time slots and bookings.

## Technologies

| Layer | Stack |
| --- | --- |
| **Frontend** | React, TypeScript, Vite |
| **Backend** | NestJS, TypeScript |
| **Database** | MongoDB |
| **Infrastructure** | Docker, Caddy |

## Architecture

The application follows a **feature-based Clean Architecture**.
Business logic is separated from controllers and presentation components.

## Security

- **Health data** — encrypted using AES-256-GCM
- **Passwords** — hashed using Argon2
- **Access tokens** — short lifetime
- **Refresh tokens** — stored hashed
