function hsvToRgb(h, s, v){
      //h *= 360;
        var r, g, b, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - Math.abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        r = [C, X, 0, 0, X, C][h];
        g = [X, C, C, X, 0, 0][h];
        b = [0, 0, X, C, C, X][h];
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}