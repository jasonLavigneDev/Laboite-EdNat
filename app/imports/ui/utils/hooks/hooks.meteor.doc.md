### Meteor Hooks

#### useMethod

```
/**
 * React hook that lazily calls a Meteor method, and return a tuple
 * @param methodName - The name of the method to call.
 * @returns A function and an object containing the result with the loading, error, and called states
 */
```

**Usage :**

```ts
const [
  fetchPosts,
  {
    loading, // The loading state of the mathod
    error, // Any error object htrown in the method resolver
    called, // A boolean that reprensents wether the function has been called at least one
    data, // The returned result from the method resolver
  },
] = useMethod('fetchPosts');

const onClick = () => fetchPosts({ authorId: 'bar' });
```

#### usePaginatedMethod

```ts
/**
 * React hooks that lazily calls a Meteor method, and an object that contains both the result and metadata of the
 * method call, and some helper functions to navigate through the result
 * @param methodName - the name of the method to call
 * @param defaultOptions @optional { defaultpageSize: int = 10, defaultPage: int = 1 }
 */
```

`usePaginatedMethod` rely upon `useMethod` but assumes a specific format of input and output from the method resolver.

The method should handle a single object argument that contains the following fields :

- `page?: number = 1` the page to load
- `itemPerPage?: number = 10` the page size
- `search?: string = ""` the search string to match

It should return a single object that contains the following fields :

- `data: any[] = []` the list of matched documents in the requested current
- `page: number` the loaded page
- `itemPerPage: number` the page size
- `total: number` the total number of document matching the search in any page

**Usage :**

```ts
const [
  fetchAdmins, // The function to call in order to fetch the page
  {
    goToNextPage, // A function that restart the query incremeting the page of 1 if possible (can't be higher than total / pageSize)
    goToPreviousPage, // A function that restart the query decremeting the page of 1 if possible (can't be lower than 1)
    page, // The current page, 1 by default
    goToPage, // A function to override the current page
    nbPage, // Total number of pages based on the current search string
    total, // Total number of documents based on the current search string
    loading, // The loading state of the mathod
    error, // Any error object htrown in the method resolver
    called, // A boolean that reprensents wether the function has been called at least one
    data, // The array of matching documents
  },
] = usePaginatedMethod('users.admins');
```

#### usePagination

Existing implementation using `Meteor.subscribe`
TODO
