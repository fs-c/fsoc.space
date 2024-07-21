// this is heap's algorithm
// https://en.wikipedia.org/wiki/Heap%27s_algorithm
const getPermutations = (inputArr) => {
    let result = [];

    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next));
            }
        }
    };

    permute(inputArr);

    return result;
};

// length of the line between two points (magnitude of vector between them)
const length = (p1, p2) =>
    Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));

const tsp = (points, getLength = length) => {
    const permutations = getPermutations(points);

    let shortestPermutation;
    let shortestLength = Infinity;

    for (const permutation of permutations) {
        let currentLength = 0;

        for (let i = 0; i < permutation.length; i++) {
            const next =
                i === permutation.length - 1
                    ? permutation[0]
                    : permutation[i + 1];

            currentLength += getLength(permutation[i], next);
        }

        if (currentLength < shortestLength) {
            shortestLength = currentLength;
            shortestPermutation = permutation;
        }
    }

    return shortestPermutation;
};

export default tsp;
