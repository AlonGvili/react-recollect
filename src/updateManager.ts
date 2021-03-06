import { logUpdate } from './shared/debug';
import state from './shared/state';
import * as paths from './shared/paths';
import { CollectorComponent, PropPath } from './shared/types';
import batchedUpdates from './shared/batchedUpdates';

type Queue = {
  components: Map<CollectorComponent, Set<string>>;
  changedPaths: Set<string>;
};

const queue: Queue = {
  components: new Map(),
  changedPaths: new Set(),
};

export const flushUpdates = () => {
  // We batch updates here so that React will collect all setState() calls
  // (one for each component being updated) before triggering a render.
  // In other words: MANY .update() calls, ONE render.
  // This is subtly different to what the Recollect batch() function does -
  // it ensures that the listeners are only notified once for
  // multiple store changes
  // In other words: MANY store updates, ONE call to flushUpdates()
  batchedUpdates(() => {
    queue.components.forEach((propsUpdated, component) => {
      logUpdate(component, Array.from(propsUpdated));

      component.update();
    });
  });

  state.manualListeners.forEach((cb) =>
    cb({
      changedProps: Array.from(queue.changedPaths),
      renderedComponents: Array.from(queue.components.keys()),
      store: state.store,
    })
  );

  queue.components.clear();
  queue.changedPaths.clear();
};

/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. `tasks.2`
 * - a path further up the object tree. E.g. a component listening
 *   on `tasks.0` need to know if `tasks = 'foo'` happens
 * And if the path being notified is the top level (an empty path), everyone
 * gets updated.
 */
export const notifyByPath = (propPath: PropPath) => {
  const pathString = paths.makeInternalString(propPath);
  const userFriendlyPropPath = paths.makeUserString(propPath);

  queue.changedPaths.add(userFriendlyPropPath);

  state.listeners.forEach((components, listenerPath) => {
    if (
      pathString === '' || // Notify everyone for top-level changes
      pathString === listenerPath
    ) {
      components.forEach((component) => {
        const propsUpdated = queue.components.get(component) || new Set();
        propsUpdated.add(userFriendlyPropPath);
        queue.components.set(component, propsUpdated);
      });
    }
  });

  // If we're not batch updating, flush the changes now, otherwise this
  // will be called when the batch is complete
  if (!state.isBatchUpdating) flushUpdates();
};

export const removeListenersForComponent = (
  componentToRemove: CollectorComponent
) => {
  state.listeners.forEach((components, listenerPath) => {
    const filteredComponents = Array.from(components).filter(
      (existingComponent) => existingComponent !== componentToRemove
    );

    if (filteredComponents.length) {
      state.listeners.set(listenerPath, new Set(filteredComponents));
    } else {
      // If there are no components left listening, remove the path
      // For example, leaving a page will unmount a bunch of components
      state.listeners.delete(listenerPath);
    }
  });
};
