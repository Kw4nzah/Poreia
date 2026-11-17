# Security policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue.

Use GitHub's private vulnerability reporting: open the repository's **Security** tab and choose
**Report a vulnerability** (a private security advisory). Include what you found, the app version
(Settings shows it) and how to reproduce it.

You can expect an acknowledgement within about a week. Poreia is a small personal project, so fixes
are made on a best-effort basis; a confirmed problem is fixed in the next update and credited in
the advisory if you wish.

Please do not test against anyone else's device or data, and do not publish details before a fix
is available.

## Supported versions

Only the latest release is supported. JavaScript and asset fixes reach installed apps as an
over-the-air update; fixes that change native code need a new APK, which the app offers from
Settings. Older APKs on the same runtime version receive the same updates.

## Scope

In scope: the app, its update mechanism (GitHub Pages bundle and GitHub release APK), and the
build workflows in `.github/`.

Out of scope: vulnerabilities in GitHub, Android or YouVersion themselves, and issues that need a
rooted or already compromised device.

More detail on what the app stores and how it is protected: [docs/SECURITY.md](docs/SECURITY.md).
What the app sends over the network: [PRIVACY.md](PRIVACY.md).
