import { watch } from "./watch";
import { reactive } from "./reactive";
import { active } from "./active";


let obj = reactive({ name: 'asdas' })
watch(active(() => obj.name), () => {
  console.log('改变了');

})

obj.name = 'dasdasd'
