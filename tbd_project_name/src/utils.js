export function vectorAdd(vectors){
    let total = [0,0,0];
    for (let i=0; i<vectors.length; i++) {
        total = [
            total[0] + vectors[i][0],
            total[1] + vectors[i][1],
            total[2] + vectors[i][2]
        ];
    }
    return total;
}


// module.exports = Util