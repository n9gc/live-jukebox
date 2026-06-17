/**
 * 可以通过动态名称传递参数的格式化器
 * @license MIT
 * @author n9gc
 */
function createFormatters(formatters, ...infos) {
  const checkDynamics = (p) => {
    if (typeof p !== "string") return;
    for (const { sign: [start, end], format } of infos) {
      if (!p.startsWith(start) || !p.endsWith(end)) continue;
      const key = p.slice(start.length, -end.length || void 0);
      return (data) => format(key, data);
    }
    return;
  };
  return new Proxy(formatters, {
    get(target, p, receiver) {
      return checkDynamics(p) ?? Reflect.get(target, p, receiver);
    }
  });
}
export {
  createFormatters
};
