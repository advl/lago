/** The most lines a picture takes in the list; a taller one is cut, and shown whole when inspected. */
export const pictureLines = 12;

/** The cells a frame adds around a picture: a line above and below, a column either side. */
export const frameCells = { cols: 2, rows: 2 } as const;

/** The columns between two pictures side by side, and between a picture and its description. */
export const gutter = 2;

/** The fewest columns a description is given beside a picture before it goes under. */
export const descriptionColumns = 20;
