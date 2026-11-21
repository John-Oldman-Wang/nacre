# @nacrejs/push

Remote push notifications for [Nacre](https://github.com/John-Oldman-Wang/nacre): register with Apple, get the device token, and handle silent pushes.

```sh
npm install @nacrejs/push
```

Installing the package is what adds `application.remoteNotifications` to your app. It needs the `aps-environment` entitlement: put it in `nacre.config.json`, and sign with a provisioning profile that has Push Notifications enabled.

```json
{ "ios": { "entitlements": { "aps-environment": "development" } } }
```

```js
const token = await application.remoteNotifications.register();
// send the token to your server
```

Visible notifications (banners, sounds) arriving and being tapped are reported by [`@nacrejs/user-notifications`](https://www.npmjs.com/package/@nacrejs/user-notifications).

License: FSL-1.1-MIT.
