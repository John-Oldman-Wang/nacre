---
type: reference
native: UIDevice.identifierForVendor
---

# `UIDevice`: `identifierForVendor` property

The **`identifierForVendor`** property is an identifier shared on this device by all apps from the same developer. It isn't a permanent device ID.

## Value

A string or `null`.

- Read-only. Assigning to it throws `TypeError`, and the value is unchanged.
- The string is a UUID such as `6F9619FF-8B86-D011-B42D-00C04FC964FF`, with uppercase letters.
- After the device restarts and before the user unlocks it for the first time, the system can't provide this value yet, and it reads `null`. This case is **not verified in the simulator**; it comes from iOS's definition.
- There is no change notification: it doesn't change within a single run.

When this value stays the same and when it changes:

| Situation | Value |
| --- | --- |
| Read several times within one run | Same |
| The app relaunches, or the system restarts | Same. **Not verified in the simulator**; from iOS's definition |
| Another app from the same developer, on the same device | Same. **Not verified in the simulator** |
| All of this developer's apps are uninstalled and then reinstalled | Changes. **Not verified in the simulator** |
| A different device | Different |

It suits uses that tolerate occasional changes, such as counting "how many devices" or giving a signed-out device a temporary ID. Sign-in state and user identity should come from tokens issued by a server.

## Examples

```js
const id = UIDevice.currentDevice.identifierForVendor;
if (id !== null) {
  console.log(id);
}
```

**Result**: Prints a UUID such as `6F9619FF-8B86-D011-B42D-00C04FC964FF`. Reading it several times within one run gives the same value.

## Corresponding iOS API

`UIDevice.identifierForVendor`. It is an `NSUUID` in ObjC; here you get its `UUIDString` directly.

## See also

- [Giving this device an identifier](../../guides/device-info.md#giving-this-device-an-identifier): generating and saving an identifier yourself
- [`crypto`](../crypto.md): `randomUUID()`
