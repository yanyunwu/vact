import { watch } from "./watch";
import { reactive } from "./reactive";
import { active } from "./active";


let obj = reactive({ list: [1, 2, 3] })
watch(active(() => obj.list), (o, n) => {
  console.log('改变了');
  // console.log(o, n);
})

// let a = [3]
// obj.list.length = 2
// obj.list[1] = a[0]


let arr = new Proxy([1, 2, 3, 4, 5], {
  set(target, prop, value, receiver) {
    console.log(prop);


    // let old = target.slice()
    let res = Reflect.set(target, prop, value)
    // console.log(target);
    // let newV = target
    // console.log(old, newV);

    return res
  }
})

arr.splice(1, 2, 888)