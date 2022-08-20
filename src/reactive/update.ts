import { Watcher } from "./watch";

let updating = false
const watcherTask: Array<Watcher> = []

export function runUpdate(watcher: Watcher, oldValue: any, newValue: any) {
  if (watcherTask.includes(watcher)) return
  watcherTask.push(watcher)

  if (!updating) {
    updating = true
    Promise.resolve()
      .then(() => {
        let watcher: Watcher | undefined = undefined
        while (watcher = watcherTask.shift()) {
          watcher.update(oldValue, newValue)
        }
      }).finally(() => {
        updating = false
      })
  }
}