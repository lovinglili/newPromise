function NewPromise(fn){
    let self = this;
    self.state = 'pending';
    self.value = undefined;
    self.rejectValue = undefined;
    self.resolvedFn = [];
    self.rejectedFn = [];

    const resolve = (value) => {
        if(self.state === 'pending') {
            self.value = value;
            self.resolvedFn.forEach(item => item(value))
            self.state = 'fulfilled';
        }
    } 

    const reject = (rejectValue) => {
        if(self.state === 'pending') {
            self.rejectValue = rejectValue;
            
            self.rejectedFn.forEach(item => item(rejectValue))
            self.state = 'rejected';
        }
    }
    fn(resolve, reject);
}

// then 方法挂载在原型链上
NewPromise.prototype.then = function(handleResolved, handleRejected) {
    let self = this;
    handleResolved = typeof handleResolved === 'function' ? handleResolved :  function (data) {resolve(data)}
    handleRejected = typeof handleRejected === 'function' ? handleRejected : function (err) {throw err}

    if(self.state === 'pending') {
        return new NewPromise((resolve,reject) => {
            self.resolvedFn.push(() => {
                // 上一个then的返回值
                const current = handleResolved(self.value);
                // 当前的回调是不是NewPromise对象
                if(current instanceof NewPromise) {
                    current.then(resolve,reject);
                } else {
                    resolve(current);
                }
            })

            self.rejectedFn.push(() => {
                const current = handleRejected(self.rejectValue);
                if(current instanceof NewPromise) {
                    current.then(resolve, reject);
                } else {
                    resolve(current);
                }
            })
        }) 
    }

    if(self.state === 'fulfilled') {
        return new NewPromise((resolve, reject) => {
            try {
                const current = handleResolved(self.value);
                if(current instanceof NewPromise) {
                    current.then(resolve,reject);
                } else {
                    resolve(current);
                }
            } catch(error) {
                reject(error);
            }
        }) 
    }

    if(self.state === 'rejected') {
        return new NewPromise((resolve,reject) => {
            try {
                const current = handleRejected(self.rejectValue);
                if(current instanceof NewPromise) {
                    current.then(resolve, reject);
                } else {
                    resolve(current);
                }
            } catch(error) {
                reject(error);
            }
        })
    }

}

NewPromise.prototype.catch = function(reject) {
    return this.then(null, reject)
  }

// const p = new NewPromise((resolve) => {
//     // setTimeout(() => {
//         resolve(33);
//     // },1000);
// })

// p.then(data => 66).then(data => {
//     console.log(data,'data')
// }).then(data => console.log(data, 'data2'))

const p2 = new NewPromise((resolve, reject) => {
    // setTimeout(() => {
        reject(33);
    // },1000);
})

p2.then(data => 66).then(data => {
    console.log(data,'data')
}).then(data => console.log(data, 'data2')).catch(data => console.log(data,'error'));

// // promise 函数 es6提供的。
// let p = new Promise((resolve, reject) => {
// 	resolve(3)
// });
// p.then().then().then(data => {
//     console.log(data,'normal')
// }).then(data=>{
// 	console.log(data,'return undefined') 
// })

// // promise 函数 es6提供的。
// let p = new Promise((resolve, reject) => {
// 	reject(3)
// });
// p.then().then().then(data => {
//     console.log(data,'normal')
// }).then(data=>{
// 	console.log(data,'return undefined') 
// }).catch(err=> console.log(err))