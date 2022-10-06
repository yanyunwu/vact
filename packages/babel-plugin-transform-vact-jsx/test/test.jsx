import VVV, {aaa} from "vactapp";

function Text(props, children) {
  const slots = props.slots
  return <>
    <div>**{props.slots}**</div>
     <div>**{slots.middle}**</div>
     <div>**{slots.bottom}**</div>
  </>
}
const $slots = {
  head: <span>头部</span>,
  middle: <span>中部</span>,
  bottom: <span>底部</span>
}

const app = <div>
  <Text slots={slots.head}></Text>
  <div>
    <button onClick={() => {
      console.log(slots.middle = 111);
    }}>中部消失</button>
  </div>
</div>
console.log(slots.middle);
createApp(app).mount('#app')
