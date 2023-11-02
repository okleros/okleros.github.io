class Matrix {
    static mul(M1, M2) {
        const M3 = [];
        for (let i = 0; i < M1.length; i++) {
            M3[i] = [];
        }
        for (let i = 0; i < M1.length; i++) {
            for (let j = 0; j < (M2[0]).length; j++) {
                let aij = 0;
                for (let k = 0; k < M2.length; k++) {
                    aij += M1[i][k] * M2[k][j];
                }
                M3[i][j] = aij;
            }
        }
        return M3;
    }
}