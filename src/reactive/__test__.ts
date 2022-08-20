import { watch } from "./watch";
import { reactive } from "./reactive";
import { active } from "./active";


let obj = reactive({ name: 'asdas' })
watch(active(() => obj.name), (o, n) => {
  console.log('改变了');
  console.log(o, n);


})