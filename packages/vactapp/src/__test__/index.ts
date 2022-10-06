
class C {
    list: Array<any>
    constructor() {
        this.list = []
    }
}

abstract class B extends C{
    say() {
        console.log(this.list)
    }
}


class A extends B {

}


let v = new A()


v.say()


