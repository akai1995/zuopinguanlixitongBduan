/**
 * Zustand → Vue 2 响应式桥接
 * 将 zustand store 包装为 Vue 2 computed 中可直接使用的响应式对象
 */
import { reactive } from 'vue'

export function createReactiveStore(useStore) {
  const api = useStore
  const store = api
  let reactiveState

  return {
    ...api,
    useState() {
      if (!reactiveState) {
        reactiveState = reactive(api.getState())
        api.subscribe((newState) => {
          Object.keys(newState).forEach((key) => {
            if (reactiveState[key] !== newState[key]) {
              reactiveState[key] = newState[key]
            }
          })
        })
      }
      return reactiveState
    },
    getState: api.getState.bind(api),
  }
}