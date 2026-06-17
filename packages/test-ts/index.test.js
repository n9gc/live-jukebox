import test from "tape";
import hello from ".";
test("\u95EE\u5019\u4E00\u4E0B", (t) => {
  t.equal(hello(0), "hello, 0!");
  t.equal(hello(1), "hello, 1!");
  t.equal(hello(2), "hello, 1!");
  t.equal(hello(3), "hello, 2!");
  t.equal(hello(35), "hello, 9227465!");
  t.end();
});
