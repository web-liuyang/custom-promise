// 2.1
enum Status {
  PENDING = "PENDING",
  FULFILLED = "FULFILLED",
  REJECTED = "REJECTED",
}

type Callback = () => void;
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void;
type Resolve<T> = (value?: T) => any;
type Reject = (reason?: any) => any;

// 1.1
class MyPromise<T = any> {
  // 2.1
  private status: Status;
  // 1.3
  private value?: T;
  // 1.5
  private reason?: any;
  // 2.2.6.1
  private onFulfilledCallback: Callback[];
  // 2.2.6.2
  private onRejectedCallback: Callback[];

  constructor(executor: Executor<T>) {
    // 2.1
    this.status = Status.PENDING;
    // 1.3
    this.value = undefined;
    // 1.5
    this.reason = undefined;
    // 2.2.6.1
    this.onFulfilledCallback = [];
    // 2.2.6.2
    this.onRejectedCallback = [];

    const resolve: Resolve<T> = value => {
      // 2.1.1
      if (this.status === Status.PENDING) {
        this.status = Status.FULFILLED;
        this.value = value;
      }

      // 2.2.6.1
      this.onFulfilledCallback.forEach(fn => fn());
    };

    const reject: Reject = reason => {
      // 2.1.1
      if (this.status === Status.PENDING) {
        this.status = Status.REJECTED;
        this.reason = reason;
      }

      // 2.2.6.2
      this.onRejectedCallback.forEach(fn => fn());
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  // 2.2
  then<K = T>(onFulfilled?: Resolve<T>, onRejected?: Reject) {
    // 2.2.7
    const promise2 = new MyPromise<K>((resolve, reject) => {
      // 2.2.1.1
      onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
      // 2.2.1.2
      onRejected = typeof onRejected === "function" ? onRejected : () => {};

      if (this.status === Status.FULFILLED) {
        // 2.2.2.2
        setTimeout(() => {
          try {
            // 2.2.2.1
            // TS 类型检测问题，无法检测onFulfilled确定为function
            // 所以为了保证 不报错，加上 非空判断
            const x = onFulfilled && onFulfilled(this.value);
            resolvePromise<K>(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === Status.REJECTED) {
        // 2.2.3.2
        setTimeout(() => {
          try {
            // 2.2.3.1
            // TS 类型检测问题，无法检测onFulfilled确定为function
            // 所以为了保证 不报错，加上 非空判断
            // 2.2.7.1
            const x = onRejected && onRejected(this.reason);
            resolvePromise<K>(promise2, x, resolve, reject);
          } catch (e) {
            // 2.2.7.2
            reject(e);
          }
        });
      }

      if (this.status === Status.PENDING) {
        this.onFulfilledCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled && onFulfilled(this.value);
              resolvePromise<K>(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });

        this.onRejectedCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected && onRejected(this.reason);
              resolvePromise<K>(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });

    // 2.2.7
    return promise2;
  }
  catch<K = T>(onRejected: Reject) {
    return this.then<K>(undefined, onRejected);
  }
}

function resolvePromise<T = any>(
  promise: MyPromise<T>,
  x: any,
  resolve: Resolve<T>,
  reject: Reject
) {
  // 2.3.1
  if (promise === x) {
    return reject(new TypeError("类型错误"));
  }

  // 2.3.3.3.3
  let called = false;

  // 2.3.3
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 2.3.3.2
    try {
      // 2.3.3.1
      const then = x.then;

      // 2.3.3.3
      if (typeof then === "function") {
        // 2.3.3.3.4
        try {
          (then as Function).call(
            x,
            // 2.3.3.3.1
            (y: T) => {
              if (called) return;
              called = true;
              // resolve(y);
              // 递归调用 - 防止resolve中的嵌套
              resolvePromise(promise, y, resolve, reject);
            },
            // 2.3.3.3.2
            (r: any) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } catch (e) {
          // 2.3.3.3.4.1
          if (called) return;
          called = true;
          // 2.3.3.3.4.2
          reject(e);
        }
      } else {
        resolve(x);
      }
    } catch (e) {
      reject(e);
    }
  } else {
    // 2.3.4
    resolve(x);
  }
}

export default MyPromise;
