### Meteor Helpers

#### callMethod

```
/**
 * It's a wrapper around Meteor's `Meteor.call` function that returns a promise instead of using a
 * callback
 * @param methodName - The name of the method you want to call.
 * @param args - The arguments to pass to the method.
 * @returns A promise that resolves to the result of the Meteor method call.
 */
```

`callMethod` should be used instead of `Meteor.call` as it :

- abstract `Meteor` under a more generic function name, making further usage and refactoring easier
- allow the usage of `promise`, which is a must have in any modern app to comply with standards

**Usage :**

```ts
const result = await callMethod('methodName', { id: 'foo' });
```
