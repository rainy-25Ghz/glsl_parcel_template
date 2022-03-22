// type Point=[number,number,number]
const startColor = [198, 52, 89]; //rgb(198 52 89)
const endColor = [96, 78, 219]; //rgb(96 78 219)
const cross = (v1: number[], v2: number[]) => {
  return [
    v1[1] * v2[2] - v2[1] * v1[2],
    v1[2] * v2[0] - v2[2] * v1[0],
    v1[0] * v2[1] - v2[0] * v1[1],
  ];
};

class SurfaceGeometry {
  public position: number[] = [];
  public indices: number[] = [];
  public normal: number[] = [];
  public textcoord: number[] = [];
  private cols: number;
  private rows: number;
  private getX(i: number) {
    return i % this.cols;
  }
  private getY(i: number) {
    return Math.floor(i / this.cols);
  }
  private getAB(a_idx, b_idx) {
    const [ax, ay, az] = [
      this.position[a_idx * 3],
      this.position[a_idx * 3 + 1],
      this.position[a_idx * 3 + 2],
    ];
    const [bx, by, bz] = [
      this.position[b_idx * 3],
      this.position[b_idx * 3 + 1],
      this.position[b_idx * 3 + 2],
    ];
    return [bx - ax, by - ay, bz - az];
  }
  constructor(data: number[], cols: number, rows: number) {
    if (data.length !== rows * cols) {
      throw new Error("data length error");
    }
    if (cols <= 1 || rows <= 1) {
      throw new Error("cols<=1 or rows<=1");
    }

    this.cols = cols;
    this.rows = rows;
    this.position = data.flatMap((z, i) => [this.getY(i), z, this.getX(i)]);
    //(0,0)(1,0)...(cols-1,0)
    // (0,1)(1,1)...(cols-1,1)逐行扫描
    // let i = 0;
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const p00 = i + j * 3; //x:i%cols,y:Math.floor(i/cols)
        const p10 = p00 + 1;
        const p11 = p00 + cols + 1;
        const p01 = p00 + cols;
        console.log(i, p00, p10, p11, p01);
        this.indices.push(...[p00, p10, p11]);
        this.indices.push(...[p00, p11, p01]);
        this.normal.push(...cross(this.getAB(p00, p10), this.getAB(p00, p11)));
        this.normal.push(...cross(this.getAB(p00, p11), this.getAB(p00, p01)));
        this.textcoord.push(...[0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);
      }
    }
    // while (i < (cols - 1) * (rows - 1)) {
    //   const p00 = i; //x:i%cols,y:Math.floor(i/cols)
    //   const p10 = i + 1;
    //   const p11 = i + cols + 1;
    //   const p01 = i + cols;
    //   console.log(i, p00, p10, p11, p01);
    //   this.indices.push(...[p00, p10, p11]);
    //   this.indices.push(...[p00, p11, p01]);
    //   this.normal.push(...cross(this.getAB(p00, p10), this.getAB(p00, p11)));
    //   this.normal.push(...cross(this.getAB(p00, p11), this.getAB(p00, p01)));
    //   this.textcoord.push(...[0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);
    //   i++;
    // }
    console.log(this.position, this.indices, this.normal, this.textcoord);
  }
}
const rols = 3,
  cols = 3,
  data = [];
for (let i = 0; i < rols; i++) {
  for (let j = 0; j < cols; j++) {
    data.push(1);
  }
}

const surface = new SurfaceGeometry(data, cols, rols);