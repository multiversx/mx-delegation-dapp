const modifiable = (base: string, modifiers: Array<any>, styles: any) =>
  modifiers.reduce((total, current) => {
    const modifier = styles[`${base}--${current}`];

    if (modifier) {
      return `${total} ${modifier}`;
    }

    return total;
  }, styles[base] || '');

export default modifiable;
