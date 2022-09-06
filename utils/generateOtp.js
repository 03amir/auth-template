function generateString() {
    let result = '';

    for (let i = 0; i < 5; i++) {
        result += Math.floor(Math.random() * 10);
    }

    return result;
}

module.exports = generateString;