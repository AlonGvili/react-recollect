# React Recollect

First things first: **don't use this**.

Browser support is terrible. I've tested it in about 2% of all possible scenarios, and I'll
probably lose interest 3 days after I publish it to npm.
However I am relying on it in this app: https://github.com/davidgilbertson/scatter-bar so it's not complete junk.

# Usage, for those that don't listen

`react-recollect` exports one object and two functions.

## The `store` object

You can treat `store` just like you'd treat any object, with one exception: you can't overwrite it.

```js
import { store } from 'react-recollect';

// Fine
store.tasks = ['one', 'two', 'three'];

// Good
store.tasks.push('four');

// No problem
delete store.tasks;

// NOPE!
store = 'cats';
```

## The `collect` function

This is a Higher Order Component. You wrap a component in `collect` to have 
Recollect look after that component.

```jsx
import React from 'react';
import { store, collect } from 'react-recollect';
import Task from './Task';

const TaskList = () => (
  <div>
    {!!store.tasks && store.tasks.map(task => (
      <Task key={task.id} task={task} />
    ))}
    <button onClick={() => {
      store.tasks.push({
        name: 'A new task',
        done: false,
      })
    }}>
      Add a task
    </button>
  </div>
);

export default collect(TaskList);
```

Recollect will:
- Watch as this component renders and record what data it used to render
- When any of that data changes, it will trigger an update of the component

Each time the component renders, Recollect re-records what data was used, so conditional rendering
works just fine.

Recollect is pretty aggressive and by default will not let React update child components while it
updates some parent component. This is because Recollect believes it knows which components need to be
updated, so React would only be wasting its time if it went diffing a bunch of children.
Maybe there's some cases where this causes a problem, so as an escape hatch you can
do `collect(MyComponent, { freeze: false})`.

## The `afterChange` function

Pass a function to `afterChange` to have it called whenever the store updates. For example, if you wanted
to sync your store to local storage, you could do the following anywhere in your app.

```js
import { afterChange, store } from 'react-recollect';

afterChange(() => {
  localStorage.setItem('site-data', JSON.stringify(store));
});
```

## Peeking into Recollect's innards
Some neat things are exposed on `window.__RR__` for tinkering in the console.

- Use `__RR__.debugOn()` to turn on debugging. The setting is stored in local storage, so
will persist between refreshes. You can combine this with Chrome's console filtering, for example to only 
see 'UPDATE' or 'SET' events. Who needs professional, well made dev tools extensions!
- Use `__RR__.debugOff()` and see what happens!
- `__RR__.getStore()` returns a reference to the store. Because of the way Recollect works, this is
'live'. For example, typing `__RR__.getStore().tasks.pop()` in the console would actually delete a task from the
store and Recollect would instruct React to re-render the appropriate components, `__RR__.getStore().tasks[1].done = true` would
tick a tickbox, and so on.
- `__RR__.getListeners()` returns the actual listeners. This is of limited use, probably.

# TODO

- [ ] Make `react` a peer dependency.
- [ ] Break the source out into multiple files
- [ ] Test what happens when you pass state down into a `collect`ed component. Instead of returning false
for `shouldComponentUpdate`, I could do a shallow check, or just use a `PureComponent`, right? Set up a performance test.