import MyPromise from "./MyPromise";

new MyPromise<string>((resolv, reject) => {
  console.log("MyPromise");
  resolv("成功1");
  // throw new Error("throw 失败1");
  // reject("失败1");

  // setTimeout(() => {
  //   // resolv("成功2");
  //   // reject("失败2");
  //   // throw new Error("throw 失败2");
  // }, 1000);
})
  .then(
    res => {
      // throw new Error("throw 失败3");
      console.log("res1:" + res);
      // return res + "a";
      return new MyPromise(resolve => {
        resolve(
          new MyPromise(resolve => {
            resolve(
              new MyPromise((resolve, reject) => {
                // resolve(res + "a");
                reject("错误");
              })
            );
          })
        );
      });
      // return promise;
    },
    err => {
      console.log("err:" + err);
    }
  )
  .then(
    res => {
      console.log("res2:" + res);
      return res + "b";
    },
    err => {
      console.log("err2:" + err);
      return err;
    }
  )
  .then(
    res => {
      console.log("res3:" + res);
      throw new Error("发生错误");
      return "123";
    },
    err => {
      console.log("err3:" + err);
    }
  )
  .catch(err => {
    console.log("catch:" + err);
  });

new MyPromise(resolve => {
  resolve("success");
})
  .then()
  .then()
  .then()
  .then()
  .then()
  .then()
  .then(res => {
    console.log(res);
  });
