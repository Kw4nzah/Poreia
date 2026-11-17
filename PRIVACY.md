# Privacy

Poreia is a small, offline-first app. It has no accounts, no analytics, no
advertising and no crash reporting. This page describes what the app stores on
your device and every network request it makes.

## What is stored, and where

Everything the app keeps stays on your device, in the app's own storage
(AsyncStorage):

- your settings: language, fish rule, notification on/off, time and repeat
  setting, and the saints you asked to be named in the prayers, with the topic
  you chose for each.

Poreia does not send these to any server.

## Network requests

The app makes only these requests:

| When | To | Why |
|---|---|---|
| App start (automatic) | GitHub Pages (`kw4nzah.github.io`) | Checks for a new over-the-air update of the app content. |
| Settings, "Check for updates" or start | `api.github.com` | Looks up the latest release to see if a newer APK exists. |
| You tap "Download and install" | GitHub release download | Downloads the APK you chose to install. |
| You tap the project link in Settings | `github.com` | Opens the project page in your browser. |
| You tap a reading's link | `bible.com` (YouVersion) | Opens the Bible passage in your browser or the YouVersion app. |

Requests to GitHub and YouVersion are ordinary web requests, so those services
see what they always see (for example your IP address and the time). Poreia adds
no identifiers of its own and no data about you.

## Notifications

Daily notifications are scheduled on your device by the operating system. They
are local: no push token is created and no server sends them.

## Permissions

The app asks for notification permission only when you turn the daily
notification on. Installing an APK uses Android's install-from-this-source
permission, which Android asks you to allow.

## Children

Poreia collects no personal data from anyone, children included.

## Changes

If this changes, the updated page will ship with the app and appear in the
commit history of this repository.
