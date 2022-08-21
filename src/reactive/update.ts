import { Watcher } from "./watch";

let updating = false
const watcherTask: Array<Watcher> = []

export function runUpdate(watcher: Watcher) {
  let index: number = watcherTask.indexOf(watcher)
  if (!(index > -1)) watcherTask.push(watcher)
  if (!updating) {
    updating = true
    Promise.resolve()
      .then(() => {
        let watcher: Watcher | undefined = undefined
        while (watcher = watcherTask.shift()) {
          watcher.update()
        }
      }).finally(() => {
        updating = false
      })
  }
}