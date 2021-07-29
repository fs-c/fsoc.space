let f1 = (x) => Math.pow(x, 2)
let f2 = (x) => Math.pow(x, 2) + 2*x + 15

for (let i = 1; i <= 1000000000; i *= 10)
  console.log(i, f1(i), f2(i), f1(i) / f2(i))
