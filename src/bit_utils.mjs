export const bit = (() => {
  const abs = (value) => {
    const mask = value >> 31;
    return (value ^ mask) - mask;
  };

  const isOdd = (value) => (value & 1) > 0;

  const floor = (value) => ~~value;

  const flipSign = (value) => ~value + 1;

  const incr = (value) => -~value;

  const decr = (value) => ~-value;

  const double = (value) => value << 1;

  const half = (value) => value >> 1;

  return { abs, isOdd, floor, flipSign, incr, decr, double, half };
})();
