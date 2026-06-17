/**
 * 工具类型
 * @license MIT
 * @author n9gc
 */
function visit(object, path, spliter = ".") {
  let key;
  while (true) {
    const index = path.indexOf(spliter);
    if (index === -1) return object?.[path];
    key = path.slice(0, index);
    path = path.slice(index + spliter.length);
    object = object?.[key];
  }
}
function capitalize(n) {
  return `${n.at(0)?.toUpperCase() ?? ""}${n.slice(1)}`;
}
export {
  capitalize,
  visit
};
