

  export function obtenerUrl(base?: string,incluyeParametro: boolean=false) {
    base ??= "";
    base = base.trim();
    return incluyeParametro
      ? base
      : (() => {
        let end = base.length;
        while (end > 0 && base.codePointAt(end - 1) === 47) end--;
        return base.slice(0, end);
      })();
  }